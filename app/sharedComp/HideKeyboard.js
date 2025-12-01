import { TouchableWithoutFeedback, Keyboard } from "react-native";

const HideKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
);

export default HideKeyboard;