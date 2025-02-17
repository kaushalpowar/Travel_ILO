import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const server = Bun.serve({
    port: 3000,
  
    fetch: async (request) => {
        const url = new URL(request.url);

        // receive JSON data to a POST request
        if(request.method === "POST" && url.pathname === "/api") {
          const data = await request.json();
          console.log("Received JSON:", data);
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: data.messages,
          });

          return Response.json({
              success: true,
              data: completion.choices[0].message
          });
        
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
            return new Response(e.message, {status: 500});
        }
    }    
});
  
console.log(`Listening on localhost:${server.port}`);
