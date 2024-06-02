

export function Hello({children}){

    return  <div>
    <h1 style={styles.header}>Hello, {children}!</h1>
    <p className="text-blue-500">Welcome to TO DO LISTER.</p>
    </div>
}



export const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      fontSize: '24px',
      marginBottom: '20px',
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      padding: '10px',
      fontSize: '16px',
      marginRight: '10px',
      flex: '1',
    },
    addButton: {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
    },
    list: {
      marginTop: '20px',
      listStyleType: 'none',
      padding: '0',
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '1px solid #ccc',
    },
    removeButton: {
      padding: '5px 10px',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: 'red',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
    },
  };
  