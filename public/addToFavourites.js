// const favouriteButtonEvent = document.getElementById('favouriteButton')

const addToFavourites = (id) => {
  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'Application/json')

  const myInit = {
    method: 'POST',
    headers: myHeaders,
    cache: 'default',
    credentials: 'same-origin',
    // lägg till properties, data
    body: JSON.stringify({ id: id }),
  }

  const myRequest = new Request('/add-favourite', myInit)

  fetch(myRequest).then((response) => {
    console.log('response == response headers', response)
  })
}
