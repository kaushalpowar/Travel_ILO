import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getAssistantReply = (messages: OpenAI.Beta.Threads.ThreadCreateParams.Message[]) : Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const thread = await openai.beta.threads.create({
                messages: messages
            });
            const stream = openai.beta.threads.runs
                .stream(thread.id, {
                    assistant_id: 'asst_Nyvj4KpPiRMZQC54G3OTsiRp'
                })
                .on("textCreated", () => {console.log("assistant >");})
                .on("toolCallCreated", (event) => {console.log("assistant " + event.type);})
                .on("messageDone", async (event) => {
                    console.log(event);
                    if(event.content[0].type === "text"){
                        const {text} = event.content[0];
                        const {annotations} = text;
                        const citations: string[] = [];
                        const files: string[] = [];

                        for(let annotation of annotations){
                            if(annotation.file_citation){
                                const citedFile = await openai.files.retrieve(
                                        annotation.file_citation.file_id);
                                let i = files.indexOf(citedFile.filename);
                                if(i === -1){
                                    files.push(citedFile.filename);
                                    i = files.length - 1;
                                }
                                citations.push("[" + (i + 1) + "] [" + citedFile.filename +
                                        "](/static/docs/" + citedFile.filename + ")");
                                text.value = text.value.replace(annotation.text, " [" + (i + 1) + "]");
                            }
                        }

                        resolve(text.value + "\n\n" + citations.join("\n"));
                    }else{
                        reject('Unexpected return type found.');
                    }
                });
        } catch (e) {
            reject(e.message);
        }
    });
};

const corsHeaders = {
    // 'Access-Control-Allow-Origin': '*',
    // 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    // 'Access-Control-Allow-Headers': 'Content-Type'
};

const server = Bun.serve({
    port: 8080,

    idleTimeout: 255, // seconds

    // enable for TLS support on server4.zolabo.com
    // tls: {
    //     key: Bun.file('/home/admin/myiom-pdf/star_zolabo_com.key'),
    //     cert: Bun.file('/home/admin/myiom-pdf/star_zolabo_com.crt'),
    // },
  
    fetch: async (request) => {
        const url = new URL(request.url);

        // receive JSON data to a POST request
        if(request.method === "POST" && url.pathname === "/api"){
            const data = await request.json();
            console.log("Received JSON:", data);

            try{
                const reply = await getAssistantReply(data);
                return Response.json({
                    success: true,
                    data: reply
                }, {headers: corsHeaders});
            }catch(e){
                console.log(e);
                return new Response(e.message, {status: 500, headers: corsHeaders});
            }

        }else if(request.method === "OPTIONS" && url.pathname === "/api"){
            return new Response('', {status: 200, headers: corsHeaders});
        
        }else if(url.pathname === "/"){
            return new Response(await Bun.file("./static/index.html").bytes(), {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        }

        try {
            const filePath = './static' + url.pathname;
            const file = Bun.file(filePath);
            const fileExists = await file.exists();
            if(! fileExists) {
                return new Response('Not Found', {status: 404});
            }
            return new Response(await file.bytes(), {
                headers: {
                  "Content-Type": file.type,
                }
            });
        } catch (e) {
            console.log(e);
            return new Response(e.message, {status: 500});
        }
    }    
});
  
console.log(`Listening on localhost:${server.port}`);
