# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


## Deployment Instructions

Step 1: Remove the build_backup folder
First, delete the build_backup folder entirely to ensure no old files remain:

bash
Copy code
rm -rf ../build_backup
This will completely remove the build_backup folder and its contents.

Step 2: Rebuild and copy fresh files
Now, let’s rebuild your project on the main branch and create a fresh copy:

Switch to main:

bash
Copy code
git checkout main
Run the build command to create the latest build files:

bash
Copy code
npm run build
Copy the fresh build folder into a new build_backup folder:

bash
Copy code
cp -R build ../build_backup
Step 3: Switch back to gh-pages
After you've created a fresh backup of the build folder, switch back to the gh-pages branch:

bash
Copy code
git checkout gh-pages
Step 4: Copy the fresh build files to the gh-pages branch
Now, copy the fresh files from the build_backup folder into the gh-pages branch:

bash
Copy code
cp -R ../build_backup/* .
Step 5: Add, commit, and push the changes
Add the files:

bash
Copy code
git add .
Commit the changes:

bash
Copy code
git commit -m "Deploy fresh build to gh-pages"
Push the changes:

bash
Copy code
git push origin gh-pages
This should ensure that only the latest build files are copied into the gh-pages branch. Let me know if this resolves the issue!