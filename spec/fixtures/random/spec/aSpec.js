for (let i = 0; i < 10; i++) {
  it(i + '', () => {
    console.log(`spec ${i}`);
  });
}