import type { ResolvedResumeData } from "@/types/resume";
import { CleanTemplate } from "./clean";
import { ModernTemplate } from "./modern";
import { ProfessionalTemplate } from "./professional";

export type TemplateComponent = React.ComponentType<{
  data: ResolvedResumeData;
}>;

export const templateComponents: Record<string, TemplateComponent> = {
  clean: CleanTemplate,
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
};

export { CleanTemplate, ModernTemplate, ProfessionalTemplate };
