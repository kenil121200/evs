import { config } from 'aws-sdk'
const AWSConfig = {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN,
    region: process.env.REACT_APP_AWS_REGION,
}
config.update(AWSConfig)