/* Converts a string to snake_case  */
function toSnakeCase(name: string): string {
  return name.toLowerCase().replace(/(\s+\/\s+)+|\s+/g, '_') // Replace spaces and slashes with underscores
}

/* Converts a string (from PascalCase e.g.) to camelCase  */
function toCamelCase(str: string): string {
  return str.replace(/^[A-Z]/, (match) => match.toLowerCase())
}

// Capitalizes a string
function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export { toCamelCase, toSnakeCase, capitalize }
