import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: process.env.REQUEST_TIME || 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    console.log('response', response)

    const body = response.data
    const { code, message } = body

    // if the custom code is not 0, it is judged as an error.
    if (code !== 0) {
      Message({
        message: message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // forbidden
      if (code === 403) {
        let confirmMessage = 'You have been logged out, you can cancel to stay on this page, or log in again'
        confirmMessage = message

        // to re-login
        MessageBox.confirm(confirmMessage, 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(message || 'Error'))
    } else {
      return body
    }
  },
  error => {
    console.log('error.response', error.response)

    let errorMessage = error.message
    try {
      const body = error.response.data
      const { code, message } = body
      errorMessage = `${message} (${code})`
    } catch (err) {
      console.log('err', err)
    }

    Message({
      message: errorMessage,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
