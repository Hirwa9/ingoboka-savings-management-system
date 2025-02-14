import { ChatTeardropText, Check, WarningCircle } from "@phosphor-icons/react";
import { useState, useRef } from "react";

const useCustomDialogs = () => {
    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('This is a toast message');
    const [toastType, setToastType] = useState('gray-300');
    const [toastSelfClose, setToastSelfClose] = useState(true);
    const [toastSelfCloseTimeout, setToastSelfCloseTimeout] = useState(4000);

    const toast = ({ message, type = 'gray-300', selfClose = true, selfCloseTimeout = 4000 }) => {
        setShowToast(true);
        setToastMessage(message);
        setToastType(type);
        setToastSelfClose(selfClose);
        setToastSelfCloseTimeout(selfCloseTimeout);
    };

    const resetToast = () => {
        setShowToast(false);
        setToastMessage('This is a toast message');
        setToastType('gray-300');
        setToastSelfClose(true);
        setToastSelfCloseTimeout(4000);
    };

    const successToast = ({ message, type = 'dark', selfClose = true, selfCloseTimeout = 4000 }) => {
        return toast({
            message: <><Check size={22} className='me-2 flex-shrink-0 opacity-50' /> {message}</>,
            type,
            selfClose,
            selfCloseTimeout,
        });
    }

    const warningToast = ({ message, type = 'warning', selfClose = true, selfCloseTimeout = 4000 }) => {
        return toast({
            message: <><WarningCircle size={22} weight='fill' className='me-1 flex-shrink-0 opacity-50' /> {message}</>,
            type,
            selfClose,
            selfCloseTimeout,
        });
    }

    const messageToast = ({ message, type = 'gray-700', selfClose = true, selfCloseTimeout = 4000 }) => {
        return toast({
            message: <><ChatTeardropText size={22} weight='fill' className='me-2 flex-shrink-0 opacity-50' /> {message}</>,
            type,
            selfClose,
            selfCloseTimeout,
        });
    }

    // Confirm Dialog
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
    const [confirmDialogAction, setConfirmDialogAction] = useState(null);
    const [confirmDialogActionText, setConfirmDialogActionText] = useState('Yes, continue');
    const [confirmDialogCloseText, setConfirmDialogCloseText] = useState('Cancel');
    const [confirmDialogCloseCallback, setConfirmDialogCloseCallback] = useState(null);
    const [confirmDialogType, setConfirmDialogType] = useState('gray-700');
    const [confirmDialogActionWaiting, setConfirmDialogActionWaiting] = useState(false);

    const customConfirmDialog = ({ message, action, actionText, closeText, closeCallback, type }) => {
        setShowConfirmDialog(true);
        setConfirmDialogMessage(message);
        setConfirmDialogAction(() => action);
        setConfirmDialogActionText(actionText || 'Yes, continue');
        setConfirmDialogCloseText(closeText || 'Cancel');
        setConfirmDialogCloseCallback(() => closeCallback);
        setConfirmDialogType(type || 'gray-700');
    };

    const resetConfirmDialog = () => {
        setShowConfirmDialog(false);
        setConfirmDialogMessage('');
        setConfirmDialogActionText('Yes, continue');
        setConfirmDialogCloseText('Cancel');
        setConfirmDialogCloseCallback(null);
        setConfirmDialogType('gray-700');
        setConfirmDialogAction(null);
        setConfirmDialogActionWaiting(false);
    };

    // Prompt
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptMessage, setPromptMessage] = useState('');
    const [promptType, setPromptType] = useState('gray-700');
    const [promptInputType, setPromptInputType] = useState('text');
    const [promptSelectInputOptions, setPromptSelectInputOptions] = useState([]);
    const promptInputValue = useRef('');
    const [promptInputPlaceholder, setPromptInputPlaceholder] = useState('Enter value');
    const [promptAction, setPromptAction] = useState(null);
    const [promptActionWaiting, setPromptActionWaiting] = useState(false);

    const customPrompt = ({ message, inputType, selectOptions, action, placeholder, type }) => {
        setShowPrompt(true);
        setPromptMessage(message);
        setPromptInputType(inputType || 'text');
        setPromptSelectInputOptions(selectOptions || []);
        setPromptAction(() => action);
        setPromptInputPlaceholder(placeholder || 'Enter value');
        setPromptType(type || 'gray-700');
    };

    const resetPrompt = () => {
        setShowPrompt(false);
        setPromptMessage('');
        setPromptType('gray-700');
        setPromptInputType('text');
        setPromptSelectInputOptions([]);
        promptInputValue.current = '';
        setPromptInputPlaceholder('Enter value');
        setPromptAction(null);
        setPromptActionWaiting(false);
    };

    return {
        // Toast
        showToast,
        setShowToast,
        toastMessage,
        toastType,
        toastSelfClose,
        toastSelfCloseTimeout,
        toast,
        successToast,
        warningToast,
        messageToast,
        resetToast,

        // Confirm Dialog
        showConfirmDialog,
        confirmDialogMessage,
        confirmDialogAction,
        confirmDialogActionText,
        confirmDialogCloseText,
        confirmDialogCloseCallback,
        confirmDialogType,
        confirmDialogActionWaiting,
        setConfirmDialogActionWaiting,
        customConfirmDialog,
        resetConfirmDialog,

        // Prompt
        showPrompt,
        promptMessage,
        promptType,
        promptInputType,
        promptSelectInputOptions,
        promptInputValue,
        promptInputPlaceholder,
        promptAction,
        promptActionWaiting,
        setPromptActionWaiting,
        customPrompt,
        resetPrompt,
    };
};

export default useCustomDialogs;