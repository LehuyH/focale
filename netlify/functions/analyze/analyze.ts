import { Handler } from '@netlify/functions'
import { analyze, IAnswer } from './shared/logic'

export const handler: Handler = async (event, context) => {
  try{
    const { answers } = JSON.parse(event.body) as { answers: IAnswer[] }
    const response = await analyze(answers)
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: response
      })
    }
  }catch(e){
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: e.message
      })
    }
  }
}
