import fetch from 'isomorphic-fetch'

export default class {
  
  static async getSession() {
    return fetch(`/auth/session`, {
      credentials: 'same-origin'
    })
    .then(response => {
      if (response.ok) {
        return Promise.resolve(response.json())
      } else {
        return Promise.reject(Error('HTTP error when trying to get session'))
      }
    })
    .then(data => {
      return data
    })
    .catch(() => Promise.reject(Error('Error trying to get session')))
  }

}