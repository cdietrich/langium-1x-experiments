import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import _ from 'lodash';
import { CompositeGeneratorNode, IndentNode, NL, toString } from 'langium';
import { AbstractElement, Domainmodel, Entity, Feature, isEntity, isPackageDeclaration, Type } from '../language-server/generated/ast';
import { extractDestinationAndName, setRootFolder } from './cli-util';
import { createMyDomainmodelServices } from '../language-server/my-domainmodel-module';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (opts: GenerateOptions): Promise<void> => {
    try {
        const services = createMyDomainmodelServices(NodeFileSystem).MyDomainmodel;
        await setRootFolder(services, opts.root);

        services.shared.workspace.LangiumDocuments.all.forEach(d => {
            const domainmodel = d.parseResult.value as Domainmodel
            const generatedDirPath = generateJava(domainmodel, d.uri.toString(false), opts.destination);
            if (!opts.quiet) {
                console.log(chalk.green(`Java classes generated successfully: ${chalk.yellow(generatedDirPath)}`));
            }
        })
    } catch (error) {
        if (!opts.quiet) {
            console.error(chalk.red(String(error)));
        }
    }
};

export type GenerateOptions = {
    destination?: string;
    root?: string;
    quiet: boolean;
}

export function generateJava(domainmodel: Domainmodel, fileName: string, destination?: string): string {
    const data = extractDestinationAndName(fileName, destination);
    return generateAbstractElements(data.destination, domainmodel.elements, data.name);
}

function generateAbstractElements(destination: string, elements: Array<AbstractElement | Type>, filePath: string): string {

    function generateAbstractElementsInternal(elements: Array<AbstractElement | Type>, filePath: string): string {
        const fullPath = path.join(destination, filePath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        const packagePath = filePath.replace(/\//g, '.').replace(/^\.+/, '');
        for (const elem of elements) {
            if (isPackageDeclaration(elem)) {
                generateAbstractElementsInternal(elem.elements, path.join(filePath, elem.name.replace(/\./g, '/')));
            } else if (isEntity(elem)) {
                const fileNode = new CompositeGeneratorNode();
                fileNode.append(`package ${packagePath};`, NL, NL);
                generateEntity(elem, fileNode);
                fs.writeFileSync(path.join(fullPath, `${elem.name}.java`), toString(fileNode));
            }
        }
        return fullPath;
    }

    return generateAbstractElementsInternal(elements, filePath);
}

function generateEntity(entity: Entity, fileNode: CompositeGeneratorNode): void {
    const maybeExtends = entity.superType ? ` extends ${entity.superType.$refText}` : '';
    fileNode.append(`class ${entity.name}${maybeExtends} {`, NL);
    fileNode.indent(classBody => {
        const featureData = entity.features.map(f => generateFeature(f, classBody));
        featureData.forEach(([generateField, , ]) => generateField());
        featureData.forEach(([, generateSetter, generateGetter]) => { generateSetter(); generateGetter(); } );
    });
    fileNode.append('}', NL);
}

function generateFeature(feature: Feature, classBody: IndentNode): [() => void, () => void, () => void] {
    const name = feature.name;
    const type = feature.type.$refText + (feature.many ? '[]' : '');

    return [
        () => { // generate the field
            classBody.append(`private ${type} ${name};`, NL);
        },
        () => { // generate the setter
            classBody.append(NL);
            classBody.append(`public void set${_.upperFirst(name)}(${type} ${name}) {`, NL);
            classBody.indent(methodBody => {
                methodBody.append(`this.${name} = ${name};`, NL);
            });
            classBody.append('}', NL);
        },
        () => { // generate the getter
            classBody.append(NL);
            classBody.append(`public ${type} get${_.upperFirst(name)}() {`, NL);
            classBody.indent(methodBody => {
                methodBody.append(`return ${name};`, NL);
            });
            classBody.append('}', NL);
        }
    ];
}