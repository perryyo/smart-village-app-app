import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AsyncStorage, StyleSheet, View } from 'react-native';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';

import AppContainer from './navigation/AppContainer';

export const App = () => {
  const [client, setClient] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const setupApolloClient = async () => {
    const link = new HttpLink({ uri: 'http://192.168.1.41:3000/graphql' });
    const cache = new InMemoryCache();
    const storage = AsyncStorage;

    const initialCache = {
      cacheItems: []
    };

    cache.writeData({ data: initialCache });

    try {
      // await before instantiating ApolloClient,
      // else queries might run before the cache is persisted
      await persistCache({
        cache,
        storage
      });
      console.warn('persisted Apollo cache');
    } catch (error) {
      console.error('Error restoring Apollo cache', error);
    }

    // Setup your Apollo Link, and any other Apollo packages here.
    const client = new ApolloClient({
      link,
      cache
    });

    client.onResetStore(() => cache.writeData({ data: initialCache }));

    setClient(client);
    setLoaded(true);
  };

  // we can provide an empty array as second argument to the effect hook to avoid activating
  // it on component updates but only for the mounting of the component.
  // this effect depend on no variables, so it is only triggered when the component mounts.
  // if an effect depends on a variable (..., [variable]), it is triggered everytime it changes.
  // provide different effects for different contexts.
  useEffect(() => {
    setupApolloClient();
  }, []);

  if (!loaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ApolloProvider client={client}>
      <AppContainer />
    </ApolloProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
