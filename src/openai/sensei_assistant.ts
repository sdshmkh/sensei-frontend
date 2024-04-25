import OpenAI from "openai";
import { env } from '../../env'


const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
})


type Message  = {
    role: 'user' | 'assistant',
    message: string
}
 
async function get_sensei(): Promise<OpenAI.Beta.Assistants.Assistant> { 
    const sensei = await openai.beta.assistants.retrieve(
    "asst_BshuwukEwFANIabXDRuAxPso"
    )
  return sensei!
}

export async function getWorkoutPlan(messageContent: string): Promise<Message[]> {
    const sensei = await get_sensei()
    console.log("get sensei", sensei)
    const thread = await openai.beta.threads.create();
    console.log("get thread", thread)

    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: messageContent
        }
      );

      console.log("create message", thread)

      let run = await openai.beta.threads.runs.createAndPoll(
        thread.id,
        { 
          assistant_id: sensei.id,
          instructions: "return response wrapped in html"
        }
      );

      console.log("fineshed run", run)

      const senseiChat = new Array<Message>()
      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        );
        console.log("sensei message", messages)
        for (const message of messages.data.reverse()) {
          // console.log(`${message.role} > ${message.content[0].text.value}`);
          senseiChat.push({role: message.role, message: message.content[0].text.value})
        }
      }
      return senseiChat
}




export function displayMessage(message: Message) {
    const messageBox = document.getElementById('chat-box')!;
    const messageElement = document.createElement('div');
    messageElement.textContent = message.message
    messageElement.className = message.role === 'assistant' ? 'alert alert-secondary' : 'alert alert-primary'; 
    messageBox.appendChild(messageElement);
    messageBox.scrollTop = messageBox.scrollHeight;
}

export function displayWorkoutPlan(messages: Message[]) {
    messages.forEach(msg => {
        displayMessage(msg);
    });
}
