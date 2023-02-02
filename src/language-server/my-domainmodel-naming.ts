import { isPackageDeclaration, PackageDeclaration } from './generated/ast';

export function toQualifiedName(pack: PackageDeclaration, childName: string): string {
    return (isPackageDeclaration(pack.$container) ? toQualifiedName(pack.$container, pack.name) : pack.name) + '.' + childName;
}

export class MyDomainModelQualifiedNameProvider {

    getQualifiedName(qualifier: PackageDeclaration | string, name: string): string {
        let prefix = qualifier;
        if (isPackageDeclaration(prefix)) {
            prefix = (isPackageDeclaration(prefix.$container)
                ? this.getQualifiedName(prefix.$container, prefix.name) : prefix.name);
        }
        return (prefix ? prefix + '.' : '') + name;
    }

}
