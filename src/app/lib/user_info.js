export type Users = {
    user_id: string;
    username: string;
    useremail: number;
    password: string;
    // In TypeScript, this is called a string union type.
    // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
    status: 'pending' | 'paid';
  };