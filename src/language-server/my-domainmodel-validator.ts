import { ValidationAcceptor, ValidationChecks } from 'langium';
import { MyDomainmodelAstType, Type } from './generated/ast';
import type { MyDomainmodelServices } from './my-domainmodel-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MyDomainmodelServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MyDomainmodelValidator;
    const checks: ValidationChecks<MyDomainmodelAstType> = {
        Type: validator.checkTypeStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class MyDomainmodelValidator {

    checkTypeStartsWithCapital(type: Type, accept: ValidationAcceptor): void {
        if (type.name) {
            const firstChar = type.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Type name should start with a capital.', { node: type, property: 'name' });
            }
        }
    }

}
