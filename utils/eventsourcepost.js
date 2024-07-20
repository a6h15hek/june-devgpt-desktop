class EventSourcePost {
  constructor(url, body = {}, headers = {'Content-Type': 'text/event-stream'}, options = {}) {
    this.url = url;
    this.options = options;
    this.options.headers = headers;
    this.options.body = JSON.stringify(body);
    this.options.method = 'POST';
    this.status = "";
    this.reader = null;
    this.onPause = false;
  }


  async connect() {
    console.log('Attempting to establish connection...');

    this.status = "connecting";
    let response;
    try {
      response = await fetch(this.url, this.options);
      if (response.status !== 200) {
        this.onError({type: 'network-error', message: 'Fetch failed'});
        return;
      }
      this.onOpenConnection();
    } catch(error) {
      console.error('Error establishing connection:', error);
      return;
    }

    // creating reader
    this.reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    this.status = "connected";
    console.info('Connection established!');

    while (true) {
      const { value, done } = await this.reader.read();
      if(this.onPause) break;

      if(this.status === "connected"){
        this.onMessage({data: value, done: done});
      }
    }
  }

  onMessage(event) {
    console.log('Message received:', event.data);
  }

  onError(event) {
    console.warn('Error occurred:', event.type, event.message);
  }

  onOpenConnection() {
    console.log('Connection opened!');
  }

  closeConnection(){
    if(this.reader){
      console.log('Attempting to close connection...');
      this.reader.cancel();
    }
    this.status = "disconnected";
    console.info('Connection closed.');
  }

  pause() {
    this.onPause = true;
    console.info('Connection paused.');
  }

  resume() {
    this.onPause = false;
    console.log('Resuming connection...');
    this.connect();
  }
}

module.exports = EventSourcePost;

// router.get('/sse', async function(req, res) {
//   const message = [
//     {
//       "content": "print the description of  tajmahal in 100 lines",
//       "role": "user"
//     }
//   ];
//
//   const requestData = {
//     model: 'gpt-35-turbo-16k-0613',
//     messages: message,
//     temperature: 0.0,
//     top_p: 0.0,
//     n: 1,
//     stream: false,
//     presence_penalty: 0.0,
//     frequency_penalty: 0.0,
//     projects: [],
//     repos: ["projects"]
//   };
//
//   let eventSourcePost = new EventSourcePost(
//     `${process.env.GPT_DEFAULT_API_URL}/v1/gpt_plugin_stream/true?sse=True`,
//     requestData,
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.GPT_API_KEY}`,
//         'Accept': 'text/event-stream'
//       },
//     }
//   );
//   eventSourcePost.onMessage = (event) => {
//     console.warn(event);
//   };
//   eventSourcePost.onError = (event) => {};
//   eventSourcePost.onOpenConnection = () => {};
//   eventSourcePost.connect();
//
//   await new Promise(resolve => setTimeout(resolve, 30000));
//
//   eventSourcePost.closeConnection();
//   res.status(200).json({  });
// });
