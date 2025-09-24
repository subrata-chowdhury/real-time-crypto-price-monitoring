# Real-Time-Crypto-Price-Monitoring  

Deploy Link: 

Tech Stack Used:    
    Backend: TypeScript, Socket.io, Express.js, Redis, Mongoose
    Frontend: TypeScript, Socket.io, ReactJS, CSS  

Run these Commands to run the React Client:  
    ```
    cd react-client-for-testing  
    npm run dev
    ```

## Endpoints: 
    ## Alerts API

    Base Path: `/api/alerts`

    ### Create Alert

    **POST** `/api/alerts/`

    Creates a new alert for a user.

    #### Request Body

    | Field         | Type     | Required | Description                                                        |
    |---------------|----------|----------|--------------------------------------------------------------------|
    | userId        | string   | Yes      | The ID of the user creating the alert.                             |
    | coinId        | string   | Yes      | The ID of the coin to monitor.                                     |
    | conditionType | string   | Yes      | The condition type: `"above"`, `"below"`, `"percent_up"`, or `"percent_down"`. |
    | threshold     | number   | Yes      | The threshold value for the alert condition.                       |
    | currency      | string   | No       | The currency for the alert (default: `"usd"`).                     |

    #### Response

    - **200 OK**: Returns the created alert object.
    - **400 Bad Request**: Missing required fields.
    - **500 Internal Server Error**: Server error.

    ---

    ### List Alerts for User

    **GET** `/api/alerts/user/:userId`

    Retrieves all alerts for a specific user.

    #### Path Parameters

    | Parameter | Type   | Description              |
    |-----------|--------|--------------------------|
    | userId    | string | The ID of the user.      |

    #### Response

    - **200 OK**: Returns an array of alert objects for the user.
    - **500 Internal Server Error**: Server error.

    ---

    ### Alert Object Schema

    | Field         | Type     | Description                                                        |
    |---------------|----------|--------------------------------------------------------------------|
    | userId        | string   | The ID of the user.                                                |
    | coinId        | string   | The ID of the coin.                                                |
    | currency      | string   | The currency for the alert (default: `"usd"`).                     |
    | conditionType | string   | The condition type: `"above"`, `"below"`, `"percent_up"`, or `"percent_down"`. |
    | threshold     | number   | The threshold value for the alert condition.                       |
    | triggered     | boolean  | Whether the alert has been triggered (default: `false`).           |
    | createdAt     | Date     | The date the alert was created.                                    |
    | triggeredAt   | Date     | The date the alert was triggered (optional).                       |


## Challenges-I-Faced

The main challenge I faced when creating this app is assigning a userId to each client without implementing auth feature.
Solution: I used socket.io 's ID as a userId to store the nessesary details like alerts etc.
