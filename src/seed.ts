/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { createCanvas } from 'canvas';
import axios from 'axios';
import dotenv from 'dotenv';
import { AuthPayload, IAuthUser } from '@auth/interfaces/auth.interface';
import JWT from 'jsonwebtoken';
import { config } from './config';
dotenv.config({});
function avatarColor(): string {
  const colors: string[] = [
    '#FF5722',
    '#00BCD4',
    '#8BC34A',
    '#FF9800',
    '#673AB7',
    '#2196F3',
    '#F44336',
    '#4CAF50',
    '#FFC107',
    '#9C27B0',
    '#03A9F4',
    '#E91E63',
    '#009688',
    '#FFEB3B',
    '#795548',
    '#CDDC39',
    '#9E9E9E',
    '#607D8B',
    '#8D6E63',
    '#FF5722',
    '#00BCD4',
    '#8BC34A',
    '#FF9800',
    '#673AB7',
    '#2196F3',
    '#F44336',
    '#4CAF50',
    '#FFC107',
    '#9C27B0',
    '#03A9F4'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateAvatar(text: string, backgroundColor: string, foregroundColor = 'white') {
  const canvas = createCanvas(200, 200);
  const context = canvas.getContext('2d');

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'normal 80px sans-serif';
  context.fillStyle = foregroundColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
}
async function seedUserData(count: number): Promise<IAuthUser[]> {
  const users: IAuthUser[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const username: string = faker.helpers.unique(faker.word.adjective, [8]);
      const color = avatarColor();
      const avatar = generateAvatar(username.charAt(0).toUpperCase(), color);

      const body = {
        username,
        email: faker.internet.email(),
        password: 'password',
        avatarColor: color,
        avatarImage: avatar
      };
      console.log(`******* ADDING USER TO DATABASE****** - ${i + 1} of ${count} - ${username}`);
      const user = await axios.post(`${process.env.API_URL}/signup`, body);
      users.push(user.data.authData);
    }
    return users;
  } catch (err) {
    console.log(err);
    return users;
  }
}

async function seedPostData(users: IAuthUser[]): Promise<void> {
  try {
    for (let i = 0; i < users.length; i++) {
      const body = {
        username: users[i].username,
        password: users[i].password
      };
      const loginResponse = await axios.post(`${process.env.API_URL}/signin`, body);

      if (loginResponse.data.token && loginResponse.data.user) {
        const postBody = {
          post: faker.lorem.words(8),
          bgColor: '#03A9F4',
          privacy: 'Public',
          gifUrl: '',
          profilePicture: '',
          feelings: 'happy'
        };
        console.log(`******* ADDING POST TO DATABASE ****** for user -> ${body.username}`);
        // Set the token and current user in the request headers
        const token = loginResponse.data.token;
        const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN!) as AuthPayload;
        const currentUser = payload;
        // Set the headers
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        };

        // Set the 'withCredentials' option to true
        const axiosConfig = {
          withCredentials: true
        };
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['x-current-user'] = `${currentUser}`;
        await axios.post(
          `${process.env.API_URL}/post`,
          { body: postBody, currentUser: currentUser, session: { jwt: token } },
          { headers, ...axiosConfig }
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function init() {
  const users = await seedUserData(2);
  // if (users.length > 0) {
  //   await seedPostData(users);
  // }
}
init();
