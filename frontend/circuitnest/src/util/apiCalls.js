import axios from 'axios'

let domain = ''
let mediaDomain = ''
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    domain = 'http://127.0.0.1:8000/api'
    mediaDomain = 'http://127.0.0.1:8000/mediafiles'
} else {
    domain = '/api'
    mediaDomain = '/mediafiles'
}

export const fetchFromApi = async ({queryKey}) => {
    const token = localStorage.getItem('token')
    if (!token) await refresh(localStorage.getItem('refresh_token'))
    try {
        const response = await axios.get(
            domain + queryKey, 
            {
                headers: {
                    'Authorization': `JWT ${token}`
                }
            }
        )        
        return response.data
    } catch (error) {
        console.log(error)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            window.location.replace('/login')
        }
        throw new Error('Network response was not ok')
    }
}

export const postToApi = async ({queryKey, data}) => {
    const token = localStorage.getItem('token')
    if (!token) await refresh(localStorage.getItem('refresh_token'))
    try {
        const response = await axios.post(
            domain + queryKey, 
            data,
            {
                headers: {
                    'Authorization': `JWT ${token}`
                }
            }
        )        
        return response.data
    } catch (error) {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            window.location.replace('/login')
        }

        return error.response
    }
}

export const patchToApi = async ({queryKey, data}) => {
    const token = localStorage.getItem('token')
    if (!token) await refresh(localStorage.getItem('refresh_token'))
    try {
        const response = await axios.patch(
            domain + queryKey, 
            data,
            {
                headers: {
                    'Authorization': `JWT ${token}`
                }
            }
        )        
        return response.data
    } catch (error) {
        console.log(error)
        if (error.response && error.response.status === 401) {
            window.location.replace('/login')
        }
        throw new Error('Network response was not ok')
    }
}

export const submitAnswer = async (answer, levelId, startType, endType, total_time, mistakes) => {
    const token = localStorage.getItem('token')
    if (!token) await refresh(localStorage.getItem('refresh_token'))
    try {
        const response = await axios.post(
            domain + '/answer/submit/', 
            {answer, levelId, startType, endType, total_time, mistakes},
            {
                headers: {
                    'Authorization': `JWT ${token}`
                }
            }
        )
        return response.data
    } catch (error) {
        console.log(error)
        // TODO handle error
        throw new Error('Network response was not ok')
    }
}

export const login = async (username, password, redirect=true) => {
    try {
        const response = await axios.post(
            domain + '/auth/jwt/create/', 
            {username, password}
        )
        localStorage.setItem('token', response.data['access'])
        localStorage.setItem('refresh_token', response.data['refresh'])
        redirect && window.location.replace('/')
    } catch (error) {
        console.log(error)
        // TODO handle error
        throw new Error('Network response was not ok')
    }
}

export const register = async (username, password, language) => {
    try {
        const response = await axios.post(
            domain + '/auth/users/', 
            {username, password}
        )
        if (response.status === 201) {
            await login(username, password, false)
            await postToApi({queryKey: '/user-language/', data: {language}})
            window.location.replace('/')
        }
        return response
    } catch (error) {
        // Handle error
        if (error.response.status === 400) {
            return error.response
        } else {
            console.log(error)
            throw new Error('Network response was not ok')
        }
    }
}

export const refresh = async (refresh_token) => {
    if (!refresh_token) window.location.replace('/login')
    try {
        const response = await axios.post(
            domain + '/auth/jwt/refresh/', 
            {refresh: refresh_token}
        )
        localStorage.setItem('token', response.data['access'])
        localStorage.setItem('refresh_token', response.data['refresh'])
    } catch (error) {
        console.log(error)
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        window.location.replace('/login')
    }
}

export const checkToken = async (token) => {
    try {
        const response = await axios.post(
            domain + '/auth/jwt/verify/',
            {token}
        )
        return response.status === 200
    } catch (error) {
        console.log(error)
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        window.location.replace('/login')
    }
}

export const getMediaUrl = (mediaUrl) => {
    return mediaDomain + mediaUrl
}