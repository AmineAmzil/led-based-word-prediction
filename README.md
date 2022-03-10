# led-based-word-prediction
An electron app for word predection.

# What does this electronJs app do:

This electron app was developed for a study about the impact of word prediction on typing performance. The app reads users' input and suggests letters from the possible words after each keypress. The suggested letters are displayed on a keyboard using its led back-lighting.

# Requirements:
- Windows 10
- Logitech [G series keyboard with RGB backlighting](https://www.logitechg.com/en-us/products/gaming-keyboards.html?filters=g,backlighting,lightsync-rgb) [like this](https://www.logitechg.com/en-eu/products/gaming-keyboards/g815-low-profile-rgb-mechanical-gaming-keyboard.html)
- MonogoDb database (e.g. [Atlas](https://www.mongodb.com/atlas))
- Email address to recieve the logs

# Metrics calculation and recognition:
The app uses internally a web application which was developed to record/gather text entry metrics. Please refer to this [link](http://www.asarif.com/resources/WebTEM/) for more details.

# Words data set:
the set of possible predicted words is limited to 2712. The used set of words and phrases is provided by [MacKenzie and Soukoreff](https://dl.acm.org/doi/10.1145/765891.765971).

# Acknowledgments:

Special thanks to our supervisor in this Human-Computer Study [Prof. Valentin Schwind](https://vali.de/).



