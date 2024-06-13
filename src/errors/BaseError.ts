// Define a base error class
export class BaseError extends Error {
  type: string
  context?: string
  timestamp: number

  constructor(type: string, message: string, name: string, context?: string) {
    super(message)
    this.name = name
    this.type = type
    this.context = context
    this.timestamp = Date.now()
  }

  toString() {
    return `${this.name} (${this.type}): ${this.message}\nContext:  ${JSON.stringify(this.context)}`
  }
}
