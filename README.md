
# Assignment 1: Hello world with Three.js .

Our assignments will be based on the Three.js framework, which allows 3D graphics in the browser. In this initial assignment, we will:

1. Set up the working environment.
   1. Install a package manager: `Node.js` and `npm`.
   2. Install `Three.js` for graphics
   3. Install `vite` to run your local web server.
2. Render a simple scene.
3. Get familiar with basic tips and debugging techniques.

The following steps are inspired by the [Three.js documentation](https://threejs.org/docs/#manual/en/introduction/Installation). Note I am using MacOS but should work on other OS too.

1. We will start by installing the package managers: Node.js and npm. You might have them already installed in your machine, you can check by opening a terminal and running:
`node -v` and `npm -v`. I have `v22.7.0` and `10.8.2`.
If you don't have npm installed, you can install it by following [the instructions](https://nodejs.org/en/download/package-manager).

2. Create a new directory for your Assignment and navigate to it in your terminal. We can call it `Assignment1`:

NOTE: Open your terminal and MAKE SURE YOU ARE INSIDE THE `Assignment1` DIRECTORY BEFORE RUNNING THE FOLLOWING COMMANDS. Navigate using `cd` command. Look up information on how to use the `cd` command if you are not familiar with it.

3. From inside the `Assignment1` folder, we will initialize a new Node.js project by running:
```bash 
npm init -y
```
1. We will install `Three.js` and `vite` by running:
```bash
# three.js
npm install --save three

# vite
npm install --save-dev vite
```
You should now have a `node_modules` folder and a `package.json` file in your project directory.

5. Our project consists of an `index.html` file with basic web stucture and elements and a `main.js` file where we will write our `Three.js` javascript code. Create these files in your project directory.

6. In `Assignment1/index.html` file, add the following code:
```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Assignment1</title>
		<style>
			body { margin: 0; }
		</style>
	</head>
	<body>
		<script type="module" src="/main.js"></script>
	</body>
</html>
```

7. In the `Assignment1/main.js` file, add the following code:
```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );

}
```

8. Now we need to start the web server and see the result in the browser. In your terminal, run:
```bash
npx vite
```
You should see a message like:
```
  VITE v5.4.2  ready in 106 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

In order to see the scene, we will navigate to `localhost:5173/` in our browser. You can do this by cmd+clicking the link in the terminal or by copying and pasting the link in your browser.

Potential error: If you see an error in the terminal like:
```
Failed to load PostCSS config: Failed to load PostCSS config
```
you can fix it by creating a `postcss.config.js` file in your Assignment1 directory with the following content:
```javascript
module.exports = {};
```

You should see a green cube rotating in the center of the screen.



## Understanding this basic scene
Please take a quick read (10min) to the [Three.js documentation](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene) to understand what each line of code is doing (even though some of it might be self-explanatory).

One important takeaway is that the `animate()` function is called each frame (30 or 60 times per second) while the code outside of it is only run once, at the beginning. This is a common pattern in Three.js and other game or 3D engines.


## Debugging
In order to debug your code, it is good to look at the error code from the console and write "print" statements in your code. 

In Google Chrome, you can open the console by right-clicking on the page and selecting "Inspect" Then cliking on the console tab in the Dev Tools. You can also open the console by pressing `Cmd+Option+J` on Mac or `Ctrl+Shift+J` on Windows/Linux.

You can print messages to the console by using `console.log("message")` in your code. This is useful to understand the flow of your code and to see the values of variables.

Every time that your code is not running, make sure to check the error log in the console for any hints on what might be wrong.


## Drawing the 3D axis

Now we will add a 3D axis to our scene. This will help us understand the orientation of the objects in the scene. We will add a red line for the x-axis, a green line for the y-axis, and a blue line for the z-axis.

We will use the following code to add the axis to our scene:
```javascript
function createAxisLine(color, start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
}

// Create axis lines
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5)); // Blue

// Add axes to scene
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);
```

As you can see, we follow a similar pattern to create the axis lines as we did with the cube. We create a geometry, a material, and this time we create a `Line` object instead of a `Mesh` object. We then add the lines to the scene.

However, once you render this, you will only be able to see two axis lines. Try to guess why this is happening before reading the next section.

Answer: The z axis is pointing exactly towards the camera, so it is not visible. We can fix this by moving the camera a bit further away from the origin. We can do this by changing the `camera.position.y` value to `1`. Take a look at how we modified the `camera.position.z` value in the previous code to understand how to do this.

## Moving the camera around
This course will cover in detail how the camera is modelled and moved in a scene. However, for now, we will be using some Three.js functionality to move the camera around. 

We will add the following code to move the camera around the scene:
```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//.....//
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10); // Where the camera is.
controls.target.set(0, 5, 0); // Where the camera is looking towards.
//.....//
function animate() {
	controls.update(); // This will update the camera position and target based on the user input.
	//.....//
}
```

Now you should be able to move the camera by:
1. Clicking and dragging the mouse to rotate the camera.
2. Scrolling to zoom in and out.
3. Holding the `Shift` key and dragging the mouse to pan the camera.



# Submission instructions.

1. Remove the `node_modules`, `package-lock.json`
2. Zip the `Assignment1` folder.
3. Upload to BruinLearn.
4. If the file is too large, you probably did something wrong. Make sure you only zip the necessary files.

   