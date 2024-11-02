declare module 'svg-baker' {
  class SVGCompiler {
    addSymbol(options: { id: string, content: string, path: string }): Promise<{ render(): string }>
  }

  export default SVGCompiler
}
