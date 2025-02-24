import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CaretDown, DotsThreeVertical, FloppyDisk, Gear, Plus, Trash } from '@phosphor-icons/react';

import { Menu, MenuItem, MenuButton, MenuDivider } from '@szhsin/react-menu';
import useCustomDialogs from '../common/hooks/useCustomDialogs';
import MyToast from '../common/Toast';
import { Axios, BASE_URL } from '../../api/api';
import { cLog, fncPlaceholder, getNumberWithSuffix, maxInputNumber } from '../../scripts/myScripts';
import CurrencyText from '../common/CurrencyText';

const SystemSettings = ({ data }) => {

    // Custom hooks
    const {
        // Toast
        showToast,
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
    } = useCustomDialogs();

    /**
     * Data
     */

    const [retrievedData, setRetrievedData] = useState({});

    useEffect(() => {
        if (data.settingsData) {
            setRetrievedData(JSON.parse(data.settingsData));
        }
    }, []);


    const sysSettings = useMemo(() => (
        retrievedData?.system
    ), [retrievedData])

    const membersSettings = useMemo(() => (
        retrievedData?.members
    ), [retrievedData])

    const savingsSettings = useMemo(() => (
        retrievedData?.savings
    ), [retrievedData])

    const expensesSettings = useMemo(() => (
        retrievedData?.expenses
    ), [retrievedData])

    const creditsSettings = useMemo(() => (
        retrievedData?.credits
    ), [retrievedData])

    // console.log(retrievedData);
    // console.log(membersSettings);

    // const [allSettings, setAllSettings] = useState([]);
    // const [settingsToShow, setSettingsToShow] = useState([]);
    // const [loadingSettings, setLoadingSettings] = useState(false);
    // const [errorLoadingSettings, setErrorLoadingSettings] = useState(false);

    // // Fetch settings
    // const fetchSettings = async () => {
    //     try {
    //         setLoadingSettings(true);
    //         const response = await Axios.get(`/api/settings/system/all`);
    //         const data = response.data;
    //         setAllSettings(data);
    //         setSettingsToShow(data);
    //         setErrorLoadingSettings(null);
    //     } catch (error) {
    //         const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load settings. Please try again.";
    //         warningToast({ message: errorMessage });
    //         console.error("Error fetching settings:", error);
    //     } finally {
    //         setLoadingSettings(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchSettings();
    // }, []);

    // console.log(allSettings[0]?.name)

    // Organisation
    const systemSettingsInitialValue = useMemo(() => ({
        logo: null,
        stamp: null,
        name: sysSettings?.name || '',
        email: sysSettings?.email || '',
        phone: sysSettings?.phone || '',
        POBox: sysSettings?.POBox || '',
        motto: sysSettings?.motto || '',
        website: sysSettings?.website || '',
        izinaRyUbutore: sysSettings?.izinaRyUbutore || '',
        manager: sysSettings?.manager || '',
        location: {
            country: 'Rwanda',
            district: 'Kigali',
            sector: 'Kigali',
            cell: 'Nyabugogo',
        },
    }), [sysSettings]);

    // Credits

    const memberRoles = useMemo(() => membersSettings?.roles || [], [membersSettings]);
    const expenseTypes = useMemo(() => expensesSettings?.types || [], [expensesSettings]);


    const [systemSettings, setSystemSettings] = useState(systemSettingsInitialValue);

    const [roleSettings, setRoleSettings] = useState(memberRoles || []);
    // console.log(memberRoles);

    // Credits

    const creditPrimaryInterest = useMemo(() => {
        return creditsSettings?.interests
            .find(t => t.type === 'primary')?.rate
    }, [creditsSettings]);

    const creditSecondaryInterest = useMemo(() => {
        return creditsSettings?.interests
            .find(t => t.type === 'secondary')?.rate
    }, [creditsSettings]);

    const [creditSettings, setCreditSettings] = useState({
        interestPrimary: creditPrimaryInterest,
        interestSecondary: creditSecondaryInterest,
        penalty: 2,
    });


    // Savings

    const monthlySavingsDay = useMemo(() => {
        return savingsSettings?.monthlyDueDay
    }, [savingsSettings]);

    const unitShareValue = useMemo(() => {
        return savingsSettings?.types
            .find(t => t.type === 'cotisation')?.amount
    }, [savingsSettings]);

    const cotisationPenalty = useMemo(() => {
        return savingsSettings?.types
            .find(t => t.type === 'cotisation')?.delayPenaltyAmount
    }, [savingsSettings]);

    const [shareSettings, setShareSettings] = useState({
        valuePerShare: unitShareValue,
    });

    const [savingSettings, setSavingSettings] = useState({
        cotisation: true,
        social: true,
        dueDate: savingsSettings?.monthlyDueDay,
        delayPenalty: cotisationPenalty,
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

    const [newRole, setNewRole] = useState('');
    const handleAddRole = () => {
        const trimmedValue = newRole.trim();
        if (trimmedValue === '') return messageToast({ message: "Enter a new role to continue", selfCloseTimeout: 2000 });

        const existingRole = roleSettings.find(role => new RegExp(`^${trimmedValue}$`, 'i').test(role));
        if (existingRole) {
            return messageToast({ message: `The role "${existingRole}" already exists`, selfCloseTimeout: 3000 });
        }
        setRoleSettings([...roleSettings, trimmedValue.toLowerCase()]);
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


    const [expenseTypeSettings, setExpenseTypeSettings] = useState(
        [
            ...expenseTypes
        ]
    );
    const [newExpenseType, setNewExpenseType] = useState('');
    const handleAddType = () => {
        const trimmedValue = newExpenseType.trim();
        if (trimmedValue === '') return messageToast({ message: "Enter a new role to continue", selfCloseTimeout: 2000 });

        const existingType = expenseTypeSettings.find(role => new RegExp(`^${trimmedValue}$`, 'i').test(role));
        if (existingType) {
            return messageToast({ message: `The role "${existingType}" already exists`, selfCloseTimeout: 3000 });
        }
        setExpenseTypeSettings([...expenseTypeSettings, trimmedValue.toLowerCase()]);
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
            {data.settingsData && (
                <>
                    <MyToast show={showToast} message={toastMessage} type={toastType} selfClose={toastSelfClose} selfCloseTimeout={toastSelfCloseTimeout} onClose={() => resetToast()} />
                    <div className="pt-2 pt-md-0 pb-3">
                        <div className="mb-3">
                            <h2 className='text-appColor'><Gear weight='fill' className="me-1 opacity-50" /> Settings</h2>
                            <div className="d-lg-flex align-items-center">
                                <img src="/images/interests_visual.png" alt="" className='d-none d-lg-block col-md-5' />
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
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary text-gray-700">
                                <h3>Role Settings</h3>
                                <div className="d-lg-flex align-items-start gap-3">
                                    <ul className='list-unstyled d-flex align-items-start gap-2 flex-wrap col-lg-7 col-xl-8'>
                                        {memberRoles.map((role, index) => (
                                            <li key={index} className='flex-align-center gap-2 ps-3 pe-2 py-1 border border-secondary border-opacity-50'>
                                                <span className='text-capitalize'>{role}</span> <Menu menuButton={
                                                    <MenuButton className="border-0 p-0 bg-transparent">
                                                        <DotsThreeVertical weight='bold' />
                                                    </MenuButton>
                                                } transition>
                                                    <MenuItem className="smaller" onClick={() => { fncPlaceholder() }}>
                                                        Edit/rename role
                                                    </MenuItem>
                                                    <MenuItem className="smaller text-danger" onClick={() => { fncPlaceholder() }}>
                                                        Remove role
                                                    </MenuItem>
                                                </Menu>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className='col'>
                                        <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Add a new role</p>
                                        <input
                                            type="text"
                                            placeholder='Enter new role'
                                            className='form-control border border-secondary rounded-0'
                                            value={newRole}
                                            onChange={e => setNewRole(e.target.value)}
                                        />
                                        <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                            onClick={handleAddRole}
                                        >
                                            <Plus /> Add role
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Credit Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary text-gray-700">
                                <h3>Credit Settings</h3>
                                <div className="d-lg-flex align-items-start gap-3">
                                    <div className="mb-2 col-lg-7 col-xl-8">
                                        <p>
                                            Interest rate per approved credit is <b className='text-nowrap'>{creditPrimaryInterest} %</b>.
                                        </p>
                                        <p className='p-3 border border-secondary smaller'>
                                            For every approved credit, the borrower is required to repay the full amount along with an interest of <span className='text-nowrap'>{creditPrimaryInterest}%</span> of the initially requested sum.
                                        </p>
                                    </div>
                                    <div className='col'>
                                        <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change interest % rate</p>
                                        <input
                                            type="number"
                                            name="interestPrimary"
                                            className='form-control border border-secondary rounded-0'
                                            value={creditSettings.interestPrimary}
                                            min={1}
                                            max={100}
                                            placeholder="Enter interest percentage rate"
                                            onChange={(e) => setCreditSettings({ ...creditSettings, interestPrimary: maxInputNumber(e, 100) })}
                                        />
                                        <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                            onClick={handleSaveCreditSettings}
                                        >
                                            <FloppyDisk /> Save changes
                                        </button>
                                        {/* Add other credit fields */}
                                    </div>
                                </div>
                            </div>

                            {/* Shares Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary text-gray-700">
                                <h3>Shares Settings</h3>
                                <div className="d-lg-flex align-items-start gap-3">
                                    <div className="mb-2 col-lg-7 col-xl-8">
                                        <p>
                                            Unit share price is <CurrencyText amount={Number(unitShareValue)} className="fw-bold" />.
                                        </p>
                                        <p className='p-3 border border-secondary smaller'>
                                            The value of one share is <CurrencyText amount={Number(unitShareValue)} />. Only multiples of this value are elligible for withdrawal or distribution at the end of the year.
                                        </p>
                                    </div>
                                    <div className='col'>
                                        <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change Unit Share value</p>
                                        <input
                                            type="number"
                                            name="interestPrimary"
                                            className='form-control border border-secondary rounded-0'
                                            value={shareSettings.valuePerShare}
                                            min={1}
                                            placeholder="Enter share value"
                                            onChange={(e) => setShareSettings({ valuePerShare: e.target.value })}
                                        />
                                        <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                            onClick={handleSaveShares}
                                        >
                                            <FloppyDisk /> Save changes
                                        </button>
                                        {/* Add other credit fields */}
                                    </div>
                                </div>
                            </div>

                            {/* Expense Types */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary text-gray-700">
                                <h3>Expense Types</h3>
                                <div className="d-lg-flex align-items-start gap-3">
                                    <ul className='list-unstyled d-flex align-items-start gap-2 flex-wrap col-lg-7 col-xl-8'>
                                        {expenseTypes.map((type, index) => (
                                            <li key={index} className='flex-align-center gap-2 ps-3 pe-2 py-1 border border-secondary border-opacity-50'>
                                                <span className='text-capitalize'>{type}</span> <Menu menuButton={
                                                    <MenuButton className="border-0 p-0 bg-transparent">
                                                        <DotsThreeVertical weight='bold' />
                                                    </MenuButton>
                                                } transition>
                                                    <MenuItem className="smaller" onClick={() => { fncPlaceholder() }}>
                                                        Edit/rename type
                                                    </MenuItem>
                                                    <MenuItem className="smaller text-danger" onClick={() => { fncPlaceholder() }}>
                                                        Remove type
                                                    </MenuItem>
                                                </Menu>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className='col'>
                                        <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Add a new expense type</p>
                                        <input
                                            type="text"
                                            placeholder='Enter new type'
                                            className='form-control border border-secondary rounded-0'
                                            value={newExpenseType}
                                            onChange={e => setNewExpenseType(e.target.value)}
                                        />
                                        <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                            onClick={handleAddType}
                                        >
                                            <Plus /> Add role
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Shares Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary text-gray-700">
                                <h3>Savings Settings</h3>
                                <div className="d-lg-flex align-items-start gap-3">
                                    <div className="mb-2 col-lg-7 col-xl-8">
                                        <p className='d-list-item list-style-square ms-4'>
                                            Monthly savings due day is on the <b>{getNumberWithSuffix(Number(monthlySavingsDay))}</b>.
                                        </p>
                                        <p className='p-3 border border-secondary smaller'>
                                            Monthly contributions and social savings should be recorded by the {getNumberWithSuffix(Number(monthlySavingsDay))} of each month. Any payments made after this date is considered late and subject to delay penalties.
                                        </p>
                                    </div>
                                    <div className='col'>
                                        <div className="mb-2">
                                            <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change savings due day</p>
                                            <input
                                                type="number"
                                                name="interestPrimary"
                                                className='form-control border border-secondary rounded-0'
                                                value={savingSettings.dueDate}
                                                min={1}
                                                max={31}
                                                placeholder="Enter montly due day"
                                                onChange={(e) => {
                                                    setSavingSettings({ ...savingSettings, dueDate: maxInputNumber(e, 31) })
                                                }}
                                            />
                                            <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                                onClick={handleSaveSavings}
                                            >
                                                <FloppyDisk /> Save changes
                                            </button>
                                        </div>
                                        {/* Add other credit fields */}
                                    </div>
                                </div>
                                <div className="d-lg-flex align-items-start gap-3">
                                    <div className="mb-2 col-lg-7 col-xl-8">
                                        <p className='d-list-item list-style-square ms-4'>
                                            Cotisation savings delay penalty is <CurrencyText amount={Number(cotisationPenalty)} className="fw-bold" />.
                                        </p>
                                        <p className='p-3 border border-secondary smaller'>
                                            A penalty of <CurrencyText amount={Number(cotisationPenalty)} /> applies to monthly contribution savings recorded after the due date mentioned above.
                                        </p>
                                    </div>
                                    <div className='col'>
                                        <div className="mb-2">
                                            <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change Delay Penalty amount</p>
                                            <input
                                                type="number"
                                                name="interestPrimary"
                                                className='form-control border border-secondary rounded-0'
                                                value={savingSettings.delayPenalty}
                                                min={1}
                                                placeholder="Enter penalty amount"
                                                onChange={(e) => setSavingSettings({ ...savingSettings, delayPenalty: e.target.value })}
                                            />
                                            <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                                onClick={handleSaveSavings}
                                            >
                                                <FloppyDisk /> Save changes
                                            </button>
                                        </div>
                                        {/* Add other credit fields */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default SystemSettings;