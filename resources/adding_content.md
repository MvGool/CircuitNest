# Adding content
This guide explains the needed steps to add content to the platform. It assumes a fresh installation as described [here](README.md). 

## Accessing admin panel
Most content will be added through the admin panel. This can be found at [localhost:8000/api/admin/] in development or [your_address/api/admin/] in production. Use the superuser credentials defined during installation to access the admin panel. 

## Components
First the different components are explained that form the basis for the content. 

### Classrooms
Classrooms are the container for most content. Levels, scenarios, achievements, etc. are all linked to a classroom. This is to ensure a class does not interfere with another class and everything is contained. This also means each class needs to be created for a specific purpose and content cannot be reused through multiple classes. 

### Scenarios
All levels are part of a scenario, this can be considered just like a chapter in most cases and should ideally be centred around a topic. Each scenario can have prerequisites which means the scenario is locked until the prerequisite scenarios are completed.

### Levels
Levels are where most content will be added. There are two types of levels: information and exercise levels. Information levels are to explain topics and give the needed theory and explanation for the following exercise levels. They mostly consist of HTML code which is displayed to the user when entering the level. Exercise levels are the exercises and main part of the platform. They come in multiple variants (`truth_table`, `graphical`, and `boolean_function`). Each level contains an input and output type that determines how the level functions. 

### Achievements
Achievements can be added to a classroom as additional challenges for the student. They have a condition to be completed and can reward a cosmetic item on completion. There are multiple types of achievement conditions defined, most importantly the `level_completion` and `scenario_completion` which can be earned on completion of a specific level or scenario. 

## Example content
The platform is created with flexibility in mind and can be used for a lot of different levels and content. This means it can be used for different educational levels. Example content is provided [here](resources/example_content) and will be added during this guide. Note that this content was used to teach the basics of logic circuits to Dutch students and therefore all the content is also in Dutch. Feel free to translate and modify the example content.

### Adding a classroom and the scenarios
The first step is to add a classroom and the desired scenarios. This can be done in the admin panel. For the classroom fill in the name, description, owner, and code, then click save. Next, switch over to scenarios using the sidebar and add your scenarios, for this guide we use the following four scenarios: "Introductie", "Geavanceerde poorten", "Functionele volledigheid", en "Optellen". For each scenario we add the previous scenario (in this order) as prerequisite. Make sure to connect them all to the class that was just created. 

### Adding levels
After creating the scenarios, the levels can be added. As this can be quite a lot of manual work when adding them through the admin panel, it is also possible to send them directly to the API using JSON files (for an introduction to JSON files, go [here](https://www.w3schools.com/js/js_json_intro.asp)). The required JSON files can be found in the [example_content/content_jsons](resources/example_content/content_jsons) folder. 

The JSON files can most easily be sent through the use of [Postman](https://www.postman.com/downloads/), which is also what we will use in this guide. Add a request in Postman and use `<your_domain>/api/custom/add/level/` as URL. Note that `<your_domain>` should either be `localhost:8000` in development or your server IP address in production. Ensure the request is set to POST and go to headers. As the database is not public, the request needs to be authorized using a token. Visit [<your_domain>/api/auth/jwt/create/](http://localhost:8000/api/auth/jwt/create/) and log in using the superuser credentials to get an access token. Copy the entire token and more over to Postman, the token should be added in a header called `Authorization` with as value `JWT <your_token>`. Now you should have something like this: 
![Postman header configuration](resources/postman_headers.png)

With the api request going to the correct place including the correct authorization token, it is time to send the levels. In the body of the request, add a field with key `levels` of type file and the [example json](resources/example_content/content_jsons/) as file. Before uploading the file, make sure to replace all the scenario id values in the file with the id from your scenario. This id can be seen in the admin panel when viewing the scenarios. 

If everything was done correctly, the response should say `200 OK` at the top and look something like this:
![Postman body response](resources/postman_body.png)

After adding all levels, they should be visible through the admin panel as well as in the environment itself (after joining the correct class). 

### Adding visuals
Currently, the levels and scenarios are added, however the visuals in the information levels are still missing. To add visuals, go to the visuals in the admin panel and add the needed visuals. For the example levels these can be found [here](resources/example_content/visuals/information_levels). The content of the information levels refer to the name of the image and should automatically select the correct image because of this. In case there are multiple images with the same name, a random id is appended to the name which is shown in the overview. In this case, also adjust the content of the information level to reflect this name change. 

After adding all visuals, the levels should be available in the created classroom.  

### Adding achievements
Achievements are one of the gamification elements implemented in CircuitNest. Creating an achievement comes in 3 steps: 
1. First an achievement condition should be made.
2. Then the achievement itself should be made.
3. Lastly, a cosmetic can be attached as reward. 
Using the admin panel it is possible to do all these at the same time by creating an achievement. The name, description, hint, and class should first be added. Next a condition can be selected or created. Then a visual should be added or created. And lastly a reward can be selected or created. Overall the creation process through the admin panel is self-explanatory and should not give any difficulties. 

The example achievements themselves can be found [here](resources/example_content/content_jsons/achievements.json) in JSON format. It is possible to add these achievements all at once in the same way the levels were added. However because of the many dependencies in the achievements, a lot of care needs to be put into ensuring the level and scenario ids are correct. When adding via Postman, use `<your_domain>/api/custom/add/achievement/` as URL with `achievements` as key in the body. 

All the example achievements have [visuals](resources/example_content/visuals/achievements) and [cosmetics](resources/example_content/visuals/cosmetics) created for them, but again due to the specific dependencies these are not linked to the JSON file. The table below shows how these visuals and cosmetics relate to the achievements:

| Achievement                         | Visual         | Cosmetic           |
|-------------------------------------|----------------|--------------------|
| Een goed begin is het halve werk    | thumbs up      | Tree glasses       |
| Dat kon beter                       | retry          | Jester hat         |
| Beter dan dit gaat niet             | star           | Star glasses       |
| Logica beginner                     | and gate       | Sunglasses         |
| Meester van de basis                | and gate gold  | Red bow            |
| Logica leerling                     | xor gate       | Triangle glasses   |
| Meester van de geavanceerde poorten | xor gate gold  | Green tie          |
| Logica expert                       | nand gate      | Blue round glasses |
| Functioneel compleet                | nand gate gold | Cyan bow           |
| Logica meester                      | addition       | Heart glasses      |
| Menselijke rekenmachine             | addition gold  | Pink tie           |
| Ik zie mezelf staan                 | medal 10       | Bronze trophy      |
| Op het podium                       | medal 3        | Silver trophy      |
| Er is er maar een de beste          | medal 1        | Gold trophy        |
| Kunnen we kinderen!                 | info sign      | Party hat          |
| Uiterlijk is zeer belangrijk        | hat            | Pink hat           |
| Alles voor de looks                 | hat fancy      | Gangster hat       |
| Volgensmij ben ik nu klaar          | 100 percent    | Frog hat           |

## Using the platform
With all the content added, the platform should now be ready to use. Once the students registered and used the classroom code, they should be able to work with the platform using the content that was added. 
