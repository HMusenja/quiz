import inquirer from 'inquirer';
import fs from 'fs/promises';

// Initialize variables
let questionsData = {};
let currentLevel = 1;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let userAnswers = [];

// Fisher-Yates Shuffle to randomize questions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to start the quiz
async function startQuiz() {
    // Load questions from external JSON file
    try {
        const data = await fs.readFile('questions.json', 'utf8');
        questionsData = JSON.parse(data);
    } catch (error) {
        console.error('Error loading questions:', error);
        return;
    }

    // Ask the user to select a level
    const levelSelection = await inquirer.prompt([
        {
            type: 'list',
            name: 'level',
            message: 'Select a level to start:',
            choices: Object.keys(questionsData.levels)
        }
    ]);

    currentLevel = levelSelection.level;

    // Shuffle the questions for the current level
    questionsData.levels[currentLevel] = shuffleArray(questionsData.levels[currentLevel]);

    // Start asking questions
    await askQuestions();
}

// Function to ask questions
async function askQuestions() {
    const levelQuestions = questionsData.levels[currentLevel];

    for (currentQuestionIndex = 0; currentQuestionIndex < levelQuestions.length; currentQuestionIndex++) {
        const questionObj = levelQuestions[currentQuestionIndex];

        // Ask the question and get the user's answer
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'userAnswer',
                message: `Q${currentQuestionIndex + 1}: ${questionObj.question}`,
                choices: questionObj.options
            }
        ]);

        userAnswers.push(answer.userAnswer);
        const isCorrect = answer.userAnswer === questionObj.correctAnswer;
        if (isCorrect) correctAnswers++;

        console.log(isCorrect ? "Correct!" : `Incorrect! Correct Answer: ${questionObj.correctAnswer}`);
        console.log(questionObj.explanation);
        console.log('-----------------------------------\n');
    }

    showScorecard();
}

// Function to display the scorecard
function showScorecard() {
    const totalQuestions = questionsData.levels[currentLevel].length;
    console.log(`Quiz Completed!`);
    console.log(`Correct Answers: ${correctAnswers}`);
    console.log(`Incorrect Answers: ${totalQuestions - correctAnswers}`);
    console.log(`Your Score: ${(correctAnswers / totalQuestions * 100).toFixed(2)}%`);
}

// Start the quiz when the script is run
startQuiz();
