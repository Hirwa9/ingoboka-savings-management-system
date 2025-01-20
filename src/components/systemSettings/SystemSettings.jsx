import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Gear } from '@phosphor-icons/react';
import useCustomDialogs from '../common/hooks/useCustomDialogs';
import MyToast from '../common/Toast';

const SystemSettings = () => {

    const BASE_URL = 'http://localhost:5000';

    // Custom hooks
    const {
        // Toast
        showToast,
        setShowToast,
        toastMessage,
        toastType,
        toast,

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
    } = useCustomDialogs();

    /**
     * Data
     */

    const [allSettings, setAllSettings] = useState([]);
    const [membersToShow, setSettingsToShow] = useState([]);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [errorLoadingSettings, setErrorLoadingSettings] = useState(false);

    // Fetch settings
    const fetchSettings = async () => {
        try {
            setLoadingSettings(true);
            const response = await axios.get(`${BASE_URL}/api/settings`);
            const data = response.data;
            setAllSettings(data);
            setSettingsToShow(data);
            setErrorLoadingSettings(null);
        } catch (error) {
            setErrorLoadingSettings("Failed to load settings. Click the button to try again.");
            toast({ message: errorLoadingSettings, type: "danger" });
            console.error("Error fetching settings:", error);
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    console.log(allSettings[0]?.name)

    const systemSettingsInitialValue = useMemo(() => ({
        logo: null,
        stamp: null,
        name: allSettings[0]?.name || '',
        email: allSettings[0]?.email || '',
        phone: allSettings[0]?.phone || '',
        POBox: allSettings[0]?.POBox || '',
        motto: allSettings[0]?.motto || '',
        website: allSettings[0]?.website || '',
        izinaRyUbutore: allSettings[0]?.izinaRyUbutore || '',
        manager: allSettings[0]?.manager || '',
        location: {
            country: 'Rwanda',
            district: 'Kigali',
            sector: 'Kigali',
            cell: 'Nyabugogo',
        },
    }), [allSettings]);

    const [systemSettings, setSystemSettings] = useState(systemSettingsInitialValue);

    const [roleSettings, setRoleSettings] = useState([
        'President',
        'Accountant',
        'Umuhwituzi',
        'Member',
    ]);

    const [creditSettings, setCreditSettings] = useState({
        interest5: 5,
        interest10: 10,
        penalty: 2,
    });

    const [shareSettings, setShareSettings] = useState({
        valuePerShare: 20000,
    });

    const [expenseTypes, setExpenseTypes] = useState([
        'Application expenses',
        'Cheque Book',
        'Leaving Members Interest',
        'SMS Charge',
        'Social',
        'Withdraw fee',
    ]);

    const [savingSettings, setSavingSettings] = useState({
        cotisation: true,
        social: true,
        dueDate: 10,
        delayPenalty: 1000,
    });

    const handleSystemSettingsChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setSystemSettings({ ...systemSettings, [name]: files[0] });
        } else {
            setSystemSettings({ ...systemSettings, [name]: value });
        }
    };

    const handleSaveSystemSettings = async () => {
        const formData = new FormData();
        for (const key in systemSettings) {
            if (key === 'location') {
                Object.keys(systemSettings.location).forEach((locKey) => {
                    formData.append(`location[${locKey}]`, systemSettings.location[locKey]);
                });
            } else {
                formData.append(key, systemSettings[key]);
            }
        }

        try {
            await axios.post(`${BASE_URL}/api/settings/system`, formData);
            alert('System settings saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save system settings!');
        }
    };

    const handleRoleChange = (index, value) => {
        const newRoles = [...roleSettings];
        newRoles[index] = value;
        setRoleSettings(newRoles);
    };

    const handleAddRole = () => {
        setRoleSettings([...roleSettings, '']);
    };

    const handleSaveRoles = async () => {
        try {
            await axios.post(`${BASE_URL}/api/settings/roles`, { roles: roleSettings });
            toast({ message: 'Roles saved successfully', type: "dark" });
        } catch (error) {
            console.error(error);
            toast({ message: 'Failed to save roles!', type: "danger" });
        }
    };

    const handleSaveCreditSettings = async () => {
        try {
            await axios.post(`${BASE_URL}/api/settings/credits`, creditSettings);
            toast({ message: 'Credit settings saved successfully!', type: "dark" });
        } catch (error) {
            console.error(error);
            toast({ message: 'Failed to save credit settings!', type: "danger" });
        }
    };

    const handleSaveShares = async () => {
        try {
            await axios.post(`${BASE_URL}/api/settings/shares`, shareSettings);
            toast({ message: 'Share settings saved successfully!', type: "dark" });
        } catch (error) {
            console.error(error);
            toast({ message: 'Failed to save share settings!', type: "danger" });
        }
    };

    const handleSaveExpenseTypes = async () => {
        try {
            await axios.post(`${BASE_URL}/api/settings/expenses`, { types: expenseTypes });
            toast({ message: 'Expense types saved successfully!', type: "dark" });
        } catch (error) {
            console.error(error);
            toast({ message: 'Failed to save expense types!', type: "danger" });
        }
    };

    const handleSaveSavings = async () => {
        try {
            await axios.post(`${BASE_URL}/api/settings/savings`, savingSettings);
            toast({ message: 'Savings settings saved successfully!', type: "dark" });
        } catch (error) {
            console.error(error);
            toast({ message: 'Failed to save savings settings!', type: "danger" });
        }
    };

    return (
        <>
            <MyToast show={showToast} message={toastMessage} type={toastType} selfClose onClose={() => setShowToast(false)} />
            <div className="pt-2 pt-md-0 pb-3">
                <div className="mb-3">
                    <h2 className='text-appColor'><Gear weight='fill' className="me-1 opacity-50" /> Settings</h2>
                    <div className="d-lg-flex align-items-center">
                        <img src="images/interests_visual.png" alt="" className='d-none d-lg-block col-md-5' />
                        <div className='alert mb-4 rounded-0 smaller fw-light'>
                            This panel provides an organized summary of interest earnings distributed to each member or family, based on their ownership shares. It ensures transparency by displaying individual share percentages, monetary interest amounts, and overall totals, offering members a clear understanding of their returns and fostering accountability.
                        </div>
                    </div>
                </div>
                <hr className='mb-4 d-lg-none' />
                <div>

                    {/* System Settings */}
                    <div>
                        <h3>System Settings</h3>
                        <input type="file" name="logo" onChange={handleSystemSettingsChange} />
                        <input type="file" name="stamp" onChange={handleSystemSettingsChange} />
                        <input type="text" name="name" placeholder="Name" value={systemSettings.name} onChange={handleSystemSettingsChange} />
                        <input type="email" name="email" placeholder="Email" value={systemSettings.email} onChange={handleSystemSettingsChange} />
                        {/* Add the rest of the fields */}
                        <button onClick={handleSaveSystemSettings}>Save System Settings</button>
                    </div>

                    {/* Role Settings */}
                    <div>
                        <h3>Role Settings</h3>
                        {roleSettings.map((role, index) => (
                            <input
                                key={index}
                                type="text"
                                value={role}
                                onChange={(e) => handleRoleChange(index, e.target.value)}
                            />
                        ))}
                        <button onClick={handleAddRole}>Add Role</button>
                        <button onClick={handleSaveRoles}>Save Roles</button>
                    </div>

                    {/* Credit Settings */}
                    <div>
                        <h3>Credit Settings</h3>
                        <input
                            type="number"
                            name="interest5"
                            value={creditSettings.interest5}
                            onChange={(e) => setCreditSettings({ ...creditSettings, interest5: e.target.value })}
                        />
                        {/* Add other credit fields */}
                        <button onClick={handleSaveCreditSettings}>Save Credit Settings</button>
                    </div>

                    {/* Shares Settings */}
                    <div>
                        <h3>Shares Settings</h3>
                        <input
                            type="number"
                            value={shareSettings.valuePerShare}
                            onChange={(e) => setShareSettings({ valuePerShare: e.target.value })}
                        />
                        <button onClick={handleSaveShares}>Save Shares Settings</button>
                    </div>

                    {/* Expense Types */}
                    <div>
                        <h3>Expense Types</h3>
                        {expenseTypes.map((type, index) => (
                            <input
                                key={index}
                                type="text"
                                value={type}
                                onChange={(e) => {
                                    const newTypes = [...expenseTypes];
                                    newTypes[index] = e.target.value;
                                    setExpenseTypes(newTypes);
                                }}
                            />
                        ))}
                        <button onClick={handleSaveExpenseTypes}>Save Expense Types</button>
                    </div>

                    {/* Savings Settings */}
                    <div>
                        <h3>Savings Settings</h3>
                        <input
                            type="number"
                            value={savingSettings.dueDate}
                            onChange={(e) => setSavingSettings({ ...savingSettings, dueDate: e.target.value })}
                        />
                        {/* Add other saving fields */}
                        <button onClick={handleSaveSavings}>Save Savings Settings</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SystemSettings;