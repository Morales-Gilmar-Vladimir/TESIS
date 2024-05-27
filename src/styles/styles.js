import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  }, 
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#0F7BB5', 
    textAlign: 'left',
    fontWeight: 'bold'
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0F7BB5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    marginRight: 5,
  },
  loginButton: {
    color: '#0F7BB5',
    textDecorationLine: 'underline',
  }, 
  registroContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registroText: {
    marginRight: 5,
  },
  registroLink: {
    color: '#0F7BB5',
    textDecorationLine: 'underline',
  }, 
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#0F7BB5', 
    borderRadius: 3,
  },
  checkboxLabel: {
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  termsLink: {
    color: '#0F7BB5',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
});

export default styles;
