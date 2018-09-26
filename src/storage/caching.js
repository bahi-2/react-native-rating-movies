import { Cache } from "react-native-cache";
import { AsyncStorage } from "react-native";

export var cachedRatings = new Cache({
    namespace: "ratings",
    policy: {
        maxEntries: 300
    },
    backend: AsyncStorage
});