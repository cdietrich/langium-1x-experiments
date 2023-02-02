import { AbstractFormatter, AstNode, Formatting } from 'langium';
import * as ast from './generated/ast';

export class MyDomainModelFormatter extends AbstractFormatter {

    protected format(node: AstNode): void {
        if (ast.isPackageDeclaration(node)) {
            const formatter = this.getNodeFormatter(node);
            const bracesOpen = formatter.keyword('{');
            const bracesClose = formatter.keyword('}');
            formatter.interior(bracesOpen, bracesClose).prepend(Formatting.indent());
            bracesClose.prepend(Formatting.newLine());
        } else if (ast.isEntity(node)) {
            const formatter = this.getNodeFormatter(node);
            const bracesOpen = formatter.keyword('{');
            const bracesClose = formatter.keyword('}');
            formatter.interior(bracesOpen, bracesClose).prepend(Formatting.indent());
            bracesClose.prepend(Formatting.newLine());
        } else if (ast.isDomainmodel(node)) {
            const formatter = this.getNodeFormatter(node);
            const nodes = formatter.nodes(...node.elements);
            nodes.prepend(Formatting.noIndent());
        }
    }

}
