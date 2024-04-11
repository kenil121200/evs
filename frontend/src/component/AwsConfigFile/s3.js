import { S3 } from 'aws-sdk'
class S3Singleton {
    static instance = undefined
static async getInstance() {        
        if (S3Singleton.instance) {
            return S3Singleton.instance
        }
        S3Singleton.instance = await S3Singleton.createInstance()
        return S3Singleton.instance
    }
static createInstance = async () => {
        return new S3({
            apiVersion: process.env.REACT_APP_AWS_S3_API_VERSION,
            region: process.env.REACT_APP_AWS_REGION,
        })
    }
}
export default S3Singleton