import type {
  InteractionFormField,
  InteractionFormValue,
} from "../../types/backend-frontend";
import {
  evaluateStringValidationRule,
  getFieldValidationError,
} from "../../types/backend-frontend";
export { isAddressValue } from "../../types/backend-frontend";

export type ValidationStatus = "passed" | "failed" | "pending";

export interface ValidationChecklistItem {
  title: string;
  status: ValidationStatus;
}

export function validateField(field: InteractionFormField, value: InteractionFormValue) {
  return getFieldValidationError(field, value);
}

export function getValidationChecklist(
  field: InteractionFormField,
  value: InteractionFormValue,
): ValidationChecklistItem[] {
  if (!field.validations?.length) {
    return [];
  }

  const stringValue = typeof value === "string" ? value.trim() : "";
  if (!stringValue) {
    return field.validations.map((rule) => ({
      title: rule.title,
      status: "pending",
    }));
  }

  return field.validations.map((rule) => ({
    title: rule.title,
    status: evaluateStringValidationRule(rule, stringValue) ? "passed" : "failed",
  }));
}
