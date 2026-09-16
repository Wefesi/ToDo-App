describe('test setup', () => {
  it('provides a jsdom document and jest-dom matchers', () => {
    document.body.innerHTML = '<main>Ready</main>'

    expect(document.querySelector('main')).toBeInTheDocument()
    expect(document.querySelector('main')).toHaveTextContent('Ready')
  })
})
