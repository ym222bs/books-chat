function onClickedCategory (category) {

  // Loopar igenom hela boklistan i klassen och väljer ut alla i den utvalda kategorin.
  document.querySelectorAll('.book-list-entry').forEach((entry) => {

    if (entry.dataset.category === category) {
        // För att kunna klicka och filtrera om och om igen i samma sökning.
      entry.style.display = 'block'
    } else {
      entry.style.display = 'none'
    // Göm denna list item som visar information för en viss bok.
    // Om boken ifråga har fel kategori.
    }
  })
}
