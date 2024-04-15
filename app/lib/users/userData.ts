
export interface User {
  id: number;
  email: string;
  password: string;
}

export default async function getUserByEmail(email: string): Promise<User> {
  return new Promise((resolve, reject) => {
    // Perform SQL query here using the provided email
    // Replace the following code with your SQL query implementation
    const result: User = {
      id: 1,
      email: 'test@test.com',
      password: 'test'
    };

    // You might want to add some logic here to check if the email matches the provided email
    if (result.email === email) {
      resolve(result);
    } else {
      reject('User not found');
    }
  });
}