import { ValidationError } from "./ValidationError";

export default function (errors: ValidationError[]): string {

    let files: Map<string, ValidationError[]> = new Map();
    errors.forEach((error) => {
        if (!files.has(error.file)) {
            files.set(error.file, []);
        }
        files.get(error.file).push(error);
    });

    let lines: string[] = [];
    lines.push("");
    lines.push("Invalid links");
    lines.push("=============");
    lines.push("");
    [...files.keys()].sort().forEach((file) => {
        lines.push(file);
        files.get(file).forEach((error) => {
            lines.push(`  - ${error.referencedUri}`);
        });
        lines.push("");
    });
    return lines.join("\n");
}
