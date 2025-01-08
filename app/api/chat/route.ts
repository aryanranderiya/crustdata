// import { StreamingTextResponse, Message } from 'ai'

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// // This is the URL of your custom API endpoint
// const CUSTOM_API_URL = process.env.CUSTOM_API_URL || 'https://your-custom-api-endpoint.com/chat'

// export async function POST(req: Request) {
//   const { messages } = await req.json()

//   const response = await fetch(CUSTOM_API_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       // Add any additional headers your API requires
//       // 'Authorization': `Bearer ${process.env.API_KEY}`,
//     },
//     body: JSON.stringify({ messages }),
//   })

//   // Check if the response is okay
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`)
//   }

//   // Check if the response is a ReadableStream
//   if (!response.body) {
//     throw new Error("Response body is not a ReadableStream")
//   }

//   // Create a TransformStream to parse the JSON chunks
//   const transformStream = new TransformStream({
//     async transform(chunk, controller) {
//       const text = new TextDecoder().decode(chunk)
//       const lines = text.split('\n').filter(line => line.trim() !== '')
      
//       for (const line of lines) {
//         if (line.startsWith('data: ')) {
//           const data = line.slice(6)
//           if (data === '[DONE]') {
//             return
//           }
//           try {
//             const parsed = JSON.parse(data)
//             const content = parsed.choices[0]?.delta?.content || ''
//             if (content) {
//               controller.enqueue(new TextEncoder().encode(content))
//             }
//           } catch (error) {
//             console.error('Error parsing JSON:', error)
//           }
//         }
//       }
//     },
//   })

//   return new StreamingTextResponse(response.body.pipeThrough(transformStream))
// }

