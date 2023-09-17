# Dynamic Schema Ingestion

### Setting up the project
Create an `env` file in `config` folder. For reference variables use `.env.example` file present in the root folder.

Create a `MYSQL` database using `XAMP`, `MYSQL Workbench` or `phpmyadmin`. Ensure that you configure the necessary database connection credentials in the `.env` file.

### Running the project
Before running the project, make sure to install node dependencies
~~~
npm i
~~~
After installing the dependencies, run the server using following command:
~~~
npm run dev
~~~

## Handling POST requests
- Table Existence Check:

    The server first checks if a table with the name specified in the collection parameter exists in the database.

    If the table doesn't exist, it proceeds to create one using the `createTableSQL` function.

- Default Primary Key:

    The ID field is added as a default primary key to the newly created table. This primary key is set to auto-increment, ensuring each new record gets a unique identifier automatically.

- Schema Field Verification:

    The server then examines the schema of the table to verify if a specific field name exists.

    Initially, the field name won't exist in the schema because it's being added for the first time.

- Field Addition to Schema:

    When the field name is not found in the existing schema, the server dynamically adds it to the schema.
- The data sent must be an `array of object`.
~~~
Example: {
    "data": [
        {
            "first_name": "John",
            "last_name": "Doe",
            "age": 17
        },
        {
            "age": 19,
            "first_name": "Mark",
            "last_name": "Manson"
        }
    ]
}
~~~

## Handling GET request
- Retrieving Records:
    When a GET request is made to the endpoint `/:collection/:id`, the server seeks to retrieve specific records from the database.

- Table Existence Check:

    Just like in the `POST` operation, the server starts by verifying the existence of the table specified by the collection parameter.

    If the table doesn't exist, it can't retrieve any records, so it handles this scenario appropriately.

- Record Retrieval:

    Assuming the table exists, the server attempts to fetch the requested record based on the provided id.

    It checks if the requested record exists in the table.

    If the record is found, it is returned in the response.

    If not found, a 404 error is returned to indicate that the record does not exist.

## Handling PUT request
When a PUT request is sent to the endpoint `/:collection/:id`, the server aims to update a specific record in the database using `id` param.

Similar to previous operations, the server initiates by verifying if the table, as specified in the collection parameter, exists.

If the table doesn't exist, it handles this scenario accordingly.

Instead of sending a `POST` request, a `PUT` request is made to distinguish the operations between the two.

The server doesn't add a field name to the table schema if it `doesn't exist`. If there's a need to introduce this feature in the future, it can be implemented following the same approach used in the POST method for consistency.

The data must be an `object`
~~~
Example: {
            "first_name": "Henry",
            "last_name": "Doe",
            "age": 19
        }
~~~

## Handling DELETE request
When a DELETE request is made to the endpoint `/:collection/:id`, the server intends to delete a specific record from the database.

- Table Existence Check:

    As with previous operations, the server commences by confirming the existence of the table mentioned in the collection parameter.

    If the table doesn't exist, it handles this scenario appropriately.

- Record Deletion:

    Assuming the table exists, the server attempts to locate and delete the specified record based on the provided `id`.

    If the record is successfully deleted, a success response is returned.

    If the record does not exist, a 404 error is returned to indicate that there was no record to delete.

## Handling Concurrent Requests

-  Implementing a mechanism (e.g., using callbacks or async/await) to serialize schema updates for a collection in order to avoid conflicts.

- MySQL provides isolation levels and locking mechanisms, which can be managed through SQL queries generated in Node.js to control data visibility and prevent conflicts.

-  Implement user authentication and authorization to control access on who can create collections