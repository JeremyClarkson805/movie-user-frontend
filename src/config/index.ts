export const server_url = import.meta.env.server_url

export const config = {
    apiBaseURL: server_url,
    timeout: 5000,
    // proxyTable: {
    //     '/api': {
    //         target: 'http://localhost',
    //         changeOrigin: true,
    //         PathRewrite: {
    //             '^/api': ''
    //         }
    //     }
    // }
}