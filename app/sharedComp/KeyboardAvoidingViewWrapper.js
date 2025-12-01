import React, { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback } from "react-native";

const KeyboardAvoidingViewWrapper = ({ children }) => {
    return (
        <KeyboardAvoidingView style={{ flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {/* <ScrollView> */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {children}
                </TouchableWithoutFeedback>
            {/* </ScrollView> */}
        </KeyboardAvoidingView>
    );
}

export default KeyboardAvoidingViewWrapper;