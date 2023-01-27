import { ValidationAcceptor, ValidationChecks } from 'langium';
import { MyDomainmodelAstType, Person } from './generated/ast';
import type { MyDomainmodelServices } from './my-domainmodel-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MyDomainmodelServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MyDomainmodelValidator;
    const checks: ValidationChecks<MyDomainmodelAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class MyDomainmodelValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
