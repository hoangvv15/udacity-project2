import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';
import axios from 'axios';

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get( "/filteredimage", async ( req, res ) => {
    const image_url = req.query.image_url;
    if (!image_url) {
      return res.status(400).send({ message: "url is required"});
    }
    // Because the Jimp library cannot read the URL provided by Udacity, 
    // it is necessary to use the axios library to convert the URL into Image Buffer.
    const { data: imageBuffer } = await axios.get(image_url, 
      { responseType: 'arraybuffer' });
    // Call filter image from URL method
    filterImageFromURL(imageBuffer)
      .then(imagePath => {
        // Successful responses have a 200 code
        res.status(200).sendFile(imagePath, errorMessage => {
          if (errorMessage) {
            return res.status(400).send( { message: errorMessage })
          }
          else {
            // Call delete local files method
            deleteLocalFiles([imagePath]);
          }
        });
      })
      .catch(errorMessage => {
        // at least one error code for caught errors (i.e. 422)
        return res.status(422).send( { message: errorMessage } );
      }); 
    
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("Empty")
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
