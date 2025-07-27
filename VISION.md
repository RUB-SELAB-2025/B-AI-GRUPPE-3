## Core Vision 
The core of OmnAIView is the visualisation and handling of time-series data. 

To make this visualisation available for all dataproviders of timeseries data
the frontend is generated with individual interfaces that should be abstracted to one interface in the long run (see #6).

## Data providers 

The core of the data providers is: 
* their data can be received via a **websocket** connection 
* they send timeseries data in the form of: `timestamp: x, values : [ y ]`

For this the first two datasources that are integrated are: 
1. The (DevDataServer)[https://github.com/AI-Gruppe/OmnAIView-DevDataServer]
2. The (OmnAIScope DataServer)[https://github.com/AI-Gruppe/OmnAIScope-DataServer]

The (OmnAIScope)[https://omnaiscope.auto-intern.de/] is a small USB-Oscilloscope developed by the Auto-Intern GmbH. The OmnAIScope DataServer provides data from the OmnAIScopes via websocket. 
The DevDataServer provides generated sinus and rectangular waveforms via websocket. 

## The first step 

In its most simple form, the frontend provides a graph in which a timeseries is displayed. Data is received from an external provider via a websocket connection 

- it has labeled axes, x in the domain of Datetime, y in the domain of numbers
- the range of the axes adapts to the data
- data is collected from a websocket and transformed into an internal datastructure
- the websocket connection is established upon clicking start

In the easiest form, we assume that the users has a OmnAIScope connected, the data collecting backend is running, and its port is known. The user does not need to configure anything in this scenario. (see #22)

## The first Release 

### The users perspective 

The objective of the first release is an application that can be used for visual analysis in the automotive industry with an OmnAIScope as the main datasource.
It is an installable application with a desktop icon, that is started via mouse clicks. 

#### Userflow 

Peter the 55 year old mechanic that does not work very often with computers.
Peter has a problem with his car. It seems that the mass air flow is defect. The engine control unit does not provide enough information, so he wants to measure the voltage from the mass air flow sensor. He connects the OmnAIScope to the vehicle and then 

1. The OmnAIScope is connected via USB to the Laptop 
2. The application **OmnAIView** is started 
3. Peter can see the start screen of OmnAIView, some simple UI that shows where to click 
4. Peter starts the measurement (with or without record settings)
5. Peter is able to see all the data that is received from the datasource with a specific sample rate 
5. Peter stops the measurement 
6. Peter saves the measurement 
7. Peter zooms and searches for specific patterns in the waveform 
8. Peter starts an external analysis on the current data via the UI 
9. Peter receives the analysis' result 
10. Peter exports the results to show the customer later, why he only had to switch the plastic seal from the mass air flow sensor 


### The developer perspective

From the developer perspective the code for this application is the foundation to integrate all other datasources and analysis in a clean and idiomatic way. 

The objective: 

1. Minimalistic interfaces with utilizing a strategy pattern to integrate different datasources via the datasource selection. 
2. Minimalistic interfaces for the analysis utilizing a strategy pattern, comparable to the datasource selection. 

This separates that the datasource- and analysis-codebases from the UI functionality. E.g.: Zooming is only implemented once and works the same, independent of the selected datasource. 

## The final idea

The final vision is an application where the user can visualize, analyze and import/export their data from which ever datasource with whichever analysis they need. 

