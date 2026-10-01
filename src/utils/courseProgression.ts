import { CourseModule } from '../types/course';

/**
 * Checks whether a module is locked for the student.
 * Rule: The very first module (index 0) is always unlocked.
 * Any subsequent module is locked until the immediately preceding module's test is completed.
 */
export function isModuleLocked(
  moduleId: string,
  modules: CourseModule[],
  completedModuleIds: string[]
): boolean {
  const index = modules.findIndex(m => m.id === moduleId);
  if (index <= 0) return false; // First module is always accessible

  const prevModule = modules[index - 1];
  return !completedModuleIds.includes(prevModule.id);
}

/**
 * Returns the prerequisite module that must be passed before accessing the given module.
 */
export function getPrerequisiteModule(
  moduleId: string,
  modules: CourseModule[]
): CourseModule | null {
  const index = modules.findIndex(m => m.id === moduleId);
  if (index <= 0) return null;
  return modules[index - 1] || null;
}
