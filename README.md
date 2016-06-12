# DashViz: an interactive data driven dashboards visualizer

This application exposes a set of interactive data driven dashboards.

Visualization is the so called front-end of modern business intelligence systems. 
Needless to say visualization is as important as any other component of a system. 
Visualization is instrumental in inferring the trends from the data, spotting outliers and making sense of the data-points.

We consider that data already exists in your MongoDB that acts as a data mart.

The application allows the users to login and logout. 
It contains a list of preconfigured dashboards accessible to the user after login. 
The user can add dashboards to his favorites and can check his history (the last visited dashboards).
A dashboard contains a list of views.
A view can be a form, a data table, or a 2D charts (Line chart, bar chart, or a pie chart).

To be able to run this application on your local machine proceed as follows:

 Markup : 1. from the dataset directory run the following commands to import the data into a local instance of MongoDB:
           1. mongoimport -d dashviz -c censuses --type csv --file censuses.csv --headerline
           2. mongoimport -d dashviz -c earthquakes --type csv --file earthquakes.csv --headerline
           3. mongoimport -d dashviz -c stocks --type csv --file stocks.csv --headerline
           4. mongoimport -d dashviz -c donors --type csv --file donors.csv --headerline
          2. from the root directory run npm install
          3. from the root directory run node server
          4. the application should be accessible at port 8080


