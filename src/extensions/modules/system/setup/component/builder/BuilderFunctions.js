import axios from 'axios'

export const getHTML = () => {
//   return axios.get('/api/get').then(response => {
//     return response.data
//   })
return "<p>xxxxxx</p>"
}

export const saveHTML = html => {
  return axios.post('/api/save', { html }).then(response => {
    return response.data
  })
}

export const extractStyles = html => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const styleElements = doc.head.querySelectorAll('style')
  let styles = ''
  styleElements.forEach(style => {
    styles += style.innerHTML
  })
  return styles
}

export const applyStyles = (html, cssStyles) => {
  const parser = new DOMParser()
  let doc = parser.parseFromString(html, 'text/html')
  let styleElement = doc.head.querySelector('style')
  if (!styleElement) {
    styleElement = doc.createElement('style')
    doc.head.appendChild(styleElement)
  }
  styleElement.innerHTML = cssStyles
  return doc.body.innerHTML
}
