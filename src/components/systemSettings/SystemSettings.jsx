import React, { useEffect, useMemo, useState } from 'react';
import './systemSettings.css';
import axios from 'axios';
import { CaretDown, CaretLeft, DotsThreeVertical, Envelope, FloppyDisk, Gear, MapPinArea, Phone, Plus } from '@phosphor-icons/react';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import useCustomDialogs from '../common/hooks/useCustomDialogs';
import MyToast from '../common/Toast';
import { Axios, BASE_URL } from '../../api/api';
import { fncPlaceholder, getNumberWithSuffix, maxInputNumber } from '../../scripts/myScripts';
import CurrencyText from '../common/CurrencyText';
import FlexibleList from '../common/FlexibleList';

const SystemSettings = ({ data, userType = 'member', refresh, startLoading, stopLoading }) => {

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

    const isAdminUser = userType === 'admin' ? true : false;

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

    // console.log('retrievedData: ', retrievedData);
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
        // logo: null,
        // stamp: null,
        name: sysSettings?.name || '',
        email: sysSettings?.email || '',
        phone: sysSettings?.phone || '',
        pobox: sysSettings?.pobox || '',
        motto: sysSettings?.motto || '',
        website: sysSettings?.website || '',
        izinaRyUbutore: sysSettings?.izinaRyUbutore || '',
        manager: sysSettings?.manager || '',
        address: sysSettings?.address,
    }), [sysSettings]);

    // Credits

    const memberRoles = useMemo(() => membersSettings?.roles || [], [membersSettings]);
    const expenseTypes = useMemo(() => expensesSettings?.types || [], [expensesSettings]);

    const [systemSettings, setSystemSettings] = useState(systemSettingsInitialValue);

    useEffect(() => {
        if (systemSettingsInitialValue) {
            setSystemSettings(systemSettingsInitialValue)
        }
    }, [systemSettingsInitialValue]);

    // console.log('systemSettings: ', systemSettings);
    // console.log('sysSettings: ', sysSettings);
    // console.log('systemSettingsInitialValue: ', systemSettingsInitialValue);

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

    // const handleRoleChange = (index, value) => {
    //     const newRoles = [...roleSettings];
    //     newRoles[index] = value;
    //     setRoleSettings(newRoles);
    // };

    const [newRole, setNewRole] = useState('');
    const handleAddRole = async () => {
        const trimmedValue = newRole.trim();
        if (trimmedValue === '') return messageToast({ message: "Enter a new role to continue", selfCloseTimeout: 2000 });

        const existingRole = memberRoles.find(role => new RegExp(`^${trimmedValue}$`, 'i').test(role));
        if (existingRole) {
            return messageToast({ message: `The role "${existingRole}" already exists`, selfCloseTimeout: 3000 });
        }
        setRoleSettings([...memberRoles, trimmedValue.toLowerCase()]);

        // console.log(roleSettings);

        // Save roles
        try {
            startLoading();
            await Axios.put(`/api/settings/members/roles`, { roles: roleSettings });
            toast({ message: 'Roles saved successfully', type: "dark" });
            refresh()
        } catch (error) {
            console.error(error);
            toast({ message: 'Failed to save roles!', type: "danger" });
        } finally {
            stopLoading();
        }
    };

    // const handleSaveRoles = async () => {
    //     try {
    //         await axios.put(`${BASE_URL}/api/settings/members/roles`, { roles: roleSettings });
    //         toast({ message: 'Roles saved successfully', type: "dark" });
    //     } catch (error) {
    //         console.error(error);
    //         toast({ message: 'Failed to save roles!', type: "danger" });
    //     }
    // };

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
            // return console.log(shareSettings);
            if (!shareSettings.valuePerShare) {
                return toast({ message: 'Enter a share value to continue!', type: "danger" });
            }
            const payload = {
                amount: shareSettings.valuePerShare,
            };

            await Axios.put(`/api/settings/savings/cotisation/amount`, payload);
            toast({ message: 'Share settings saved successfully!', type: "dark" });
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load settings. Please try again.";
            warningToast({ message: errorMessage });
            console.error("Error fetching settings:", error);
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
                                <img src="/images/settings_visual.png" alt="" className='d-none d-lg-block col-md-5' />
                                <div className='alert mb-4 rounded-0 smaller fw-light'>
                                    This panel provides an organized structure for the system settings, from business preferences and security configurations to application behavior customization. <span className='d-none d-md-inline'>Easily adjust features and certain information to suit your workflow while ensuring optimal performance and accessibility.</span>
                                </div>
                            </div>
                        </div>
                        <hr className='mb-4 d-lg-none' />
                        <div>
                            {/* System Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary border-opacity-25 text-gray-700">
                                <h3>System Settings</h3>
                                <div className='d-flex flex-column-reverse flex-xl-row py-3 py-xl-5'>
                                    <div className='col-xl-8'>
                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysName" className='col-3 text-end pe-3'>Name</label>
                                            <input type="text"
                                                id="sysName"
                                                name="name"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Name"
                                                value={systemSettings?.name}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysCountry" className='col-3 text-end pe-3'>Country</label>
                                            <input type="text"
                                                id="sysCountry"
                                                name="country"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Country"
                                                value={systemSettings?.address?.country}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysDistrict" className='col-3 text-end pe-3'>District</label>
                                            <input type="text"
                                                id="sysDistrict"
                                                name="district"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="District"
                                                value={systemSettings?.address?.district}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysSector" className='col-3 text-end pe-3'>Sector</label>
                                            <input type="text"
                                                id="sysSector"
                                                name="sector"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Sector"
                                                value={systemSettings?.address?.sector}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysCell" className='col-3 text-end pe-3'>Cell</label>
                                            <input type="text"
                                                id="sysCell"
                                                name="cell"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Cell"
                                                value={systemSettings?.address?.cell}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysIzinaRyUbutore" className='col-3 text-end pe-3'>Izina ry'ubutore</label>
                                            <input type="text"
                                                id="sysIzinaRyUbutore"
                                                name="izinaRyUbutore"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Izina ry'ubutore"
                                                value={systemSettings?.izinaRyUbutore}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysMotto" className='col-3 text-end pe-3'>Motto</label>
                                            <input type="text"
                                                id="sysMotto"
                                                name="motto"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Motto"
                                                value={systemSettings?.motto}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysEmail" className='col-3 text-end pe-3'>Email</label>
                                            <input type="text"
                                                id="sysEmail"
                                                name="email"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Email"
                                                value={systemSettings?.email}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysPhone" className='col-3 text-end pe-3'>Phone</label>
                                            <input type="number"
                                                id="sysPhone"
                                                name="phone"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Phone"
                                                value={systemSettings?.phone}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysPhone" className='col-3 text-end pe-3'>PO Box</label>
                                            <input type="text"
                                                id="sysPobox"
                                                name="pobox"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="PO Box"
                                                value={systemSettings?.pobox}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>

                                        <div className='d-flex align-items-center justify-content-xl-center mb-2 px-2 px-sm-3'>
                                            <label htmlFor="sysManager" className='col-3 text-end pe-3'>Manager</label>
                                            <input type="text"
                                                id="sysManager"
                                                name="manager"
                                                readOnly
                                                // readOnly={!isAdminUser}
                                                placeholder="Manager"
                                                value={systemSettings?.manager}
                                                onChange={handleSystemSettingsChange}
                                                className='flex-grow-1 form-control border border-secondary border-opacity-25 rounded-0'
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column flex-xl-row-reverse align-items-center gap-3 h-fit mb-5 px-xl-3 sticky-info">
                                        <div>
                                            <p className='small'>
                                                {isAdminUser ? (
                                                    <>
                                                        Update and manage your organization's details, including the name, address, contact information, and management details.
                                                    </>
                                                ) : (
                                                    <>
                                                        Access your organization's details,  all in one place. Stay connected with essential business information and ensure you have quick access when needed.
                                                    </>
                                                )}
                                            </p>
                                            <div className="w-100 d-flex align-items-center mb-2">
                                                <div className="p-2 d-flex align-items-center justify-content-center rounded-circle me-2 me-sm-3 bg-gray-300">
                                                    <Phone size={20} fill='var(--bs-gray-700)' />
                                                </div>
                                                <div className="small d-grid">
                                                    <span className="me-2 fw-bold"> Phone:</span> <span>{systemSettingsInitialValue?.phone}</span>
                                                </div>
                                            </div>
                                            <div className="w-100 d-flex align-items-center mb-2">
                                                <div className="p-2 d-flex align-items-center justify-content-center rounded-circle me-2 me-sm-3 bg-gray-300">
                                                    <Envelope size={20} fill='var(--bs-gray-700)' />
                                                </div>
                                                <div className="small d-grid">
                                                    <span className="me-2 fw-bold"> Email:</span> <span>{systemSettingsInitialValue?.email}</span>
                                                </div>
                                            </div>
                                            <div className="w-100 d-flex align-items-center mb-2">
                                                <div className="p-2 d-flex align-items-center justify-content-center rounded-circle me-2 me-sm-3 bg-gray-300">
                                                    <MapPinArea size={20} fill='var(--bs-gray-700)' />
                                                </div>
                                                <div className="small d-grid">
                                                    <span className="me-2 fw-bold"> Location:</span> <span>
                                                        <span className="text-capitalize-first-letter">{systemSettingsInitialValue?.address?.district}</span>, <span className="text-capitalize-first-letter">{systemSettingsInitialValue?.address?.country}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <CaretLeft size={30} className='flex-shrink-0 opacity-50 d-none d-xl-inline' />
                                        <CaretDown size={30} className='flex-shrink-0 opacity-50 d-xl-none' />
                                    </div>
                                </div>

                                {/* <input type="file" name="logo" onChange={handleSystemSettingsChange} />
                                <input type="file" name="stamp" onChange={handleSystemSettingsChange} />
                                <input type="text" name="name" placeholder="Name" value={systemSettings.name} onChange={handleSystemSettingsChange} />
                                <input type="email" name="email" placeholder="Email" value={systemSettings.email} onChange={handleSystemSettingsChange} /> */}

                                {/* Add the rest of the fields */}
                                {/* <button onClick={handleSaveSystemSettings}>Save System Settings</button> */}
                            </div>

                            {/* Role Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary border-opacity-25 text-gray-700">
                                <h3>Role Settings</h3>
                                <div className={`${isAdminUser ? 'd-lg-flex' : ''} align-items-start gap-3`}>
                                    <div className={`${isAdminUser ? 'col-lg-7 col-xl-8' : ''}`}>
                                        <p className='d-list-item list-style-square ms-4'>
                                            Group membership roles used to categorize team members based on their responsibilities and permissions in the organization.
                                        </p>
                                        <FlexibleList
                                            list={memberRoles.map(role => (
                                                {
                                                    title: role,
                                                    icon: isAdminUser ? (
                                                        <Menu menuButton={
                                                            <MenuButton className="border-0 p-0 bg-transparent">
                                                                <DotsThreeVertical weight='bold' />
                                                            </MenuButton>
                                                        } transition>
                                                            <MenuItem className="smaller" onClick={() => { fncPlaceholder() }}>
                                                                Edit
                                                            </MenuItem>
                                                            <MenuItem className="smaller text-danger" onClick={() => { fncPlaceholder() }}>
                                                                Remove
                                                            </MenuItem>
                                                        </Menu>
                                                    ) : null
                                                }
                                            ))}
                                            containerBg='transparent'
                                            listItemClassName='shadow-sm'
                                        />
                                    </div>
                                    {isAdminUser && (
                                        <div className='col'>
                                            <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Add a new role</p>
                                            <input
                                                type="text"
                                                placeholder='Enter new role'
                                                readOnly
                                                className='form-control border border-secondary border-opacity-10 rounded-0'
                                                value={newRole}
                                                onChange={e => setNewRole(e.target.value)}
                                            />
                                            <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                                onClick={handleAddRole}
                                            >
                                                <Plus /> Add role
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Credit Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary border-opacity-25 text-gray-700">
                                <h3>Credit Settings</h3>
                                <div className={`${isAdminUser ? 'd-lg-flex' : ''} align-items-start gap-3`}>
                                    <div className={`mb-2 ${isAdminUser ? 'col-lg-7 col-xl-8' : ''}`}>
                                        <p className='d-list-item list-style-square ms-4'>
                                            Interest rate per approved credit is <b className='text-nowrap'>{creditPrimaryInterest} %</b>.
                                        </p>
                                        <p className='p-3 border border-secondary border-opacity-10 smaller'>
                                            For every approved credit, the borrower is required to repay the full amount along with an interest of <span className='text-nowrap'>{creditPrimaryInterest}%</span> of the initially requested sum.
                                        </p>
                                    </div>
                                    {isAdminUser && (
                                        <div className='col'>
                                            <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change interest % rate</p>
                                            <input
                                                type="number"
                                                name="interestPrimary"
                                                readOnly
                                                className='form-control border border-secondary border-opacity-10 rounded-0'
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
                                    )}
                                </div>
                            </div>

                            {/* Shares Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary border-opacity-25 text-gray-700">
                                <h3>Shares Settings</h3>
                                <div className={`${isAdminUser ? 'd-lg-flex' : ''} align-items-start gap-3`}>
                                    <div className={`mb-2 ${isAdminUser ? 'col-lg-7 col-xl-8' : ''}`}>
                                        <p className='d-list-item list-style-square ms-4'>
                                            Unit share price is <CurrencyText amount={Number(unitShareValue)} className="fw-bold" />.
                                        </p>
                                        <p className='p-3 border border-secondary border-opacity-10 smaller'>
                                            The value of one share is <CurrencyText amount={Number(unitShareValue)} />. Only multiples of this value are elligible for withdrawal or distribution at the end of the year.
                                        </p>
                                    </div>

                                    {isAdminUser && (
                                        <div className='col'>
                                            <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change Unit Share value</p>
                                            <input
                                                type="number"
                                                name="interestPrimary"
                                                readOnly
                                                className='form-control border border-secondary border-opacity-10 rounded-0'
                                                value={shareSettings.valuePerShare}
                                                min={1}
                                                placeholder="Enter share value"
                                                onChange={(e) => setShareSettings({ valuePerShare: e.target.value })}
                                            />
                                            <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                                disabled={!shareSettings.valuePerShare}
                                                onClick={handleSaveShares}
                                            >
                                                <FloppyDisk /> Save changes
                                            </button>
                                            {/* Add other credit fields */}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expense Types */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary border-opacity-25 text-gray-700">
                                <h3>Expense Types</h3>
                                <div className={`${isAdminUser ? 'd-lg-flex' : ''} align-items-start gap-3`}>
                                    <div className={`${isAdminUser ? 'col-lg-7 col-xl-8' : ''}`}>
                                        <p className='d-list-item list-style-square ms-4'>
                                            The following expense types are available:
                                        </p>
                                        <FlexibleList
                                            list={expenseTypes.map(type => (
                                                {
                                                    title: type,
                                                    icon: isAdminUser ? (
                                                        <Menu menuButton={
                                                            <MenuButton className="border-0 p-0 bg-transparent">
                                                                <DotsThreeVertical weight='bold' />
                                                            </MenuButton>
                                                        } transition>
                                                            <MenuItem className="smaller" onClick={() => { fncPlaceholder() }}>
                                                                Edit
                                                            </MenuItem>
                                                            <MenuItem className="smaller text-danger" onClick={() => { fncPlaceholder() }}>
                                                                Remove
                                                            </MenuItem>
                                                        </Menu>
                                                    ) : null
                                                }
                                            ))}
                                            containerBg='transparent'
                                            listItemClassName='shadow-sm'
                                        />
                                    </div>

                                    {isAdminUser && (
                                        <div className='col'>
                                            <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Add a new expense type</p>
                                            <input
                                                type="text"
                                                placeholder='Enter new type'
                                                readOnly
                                                className='form-control border border-secondary border-opacity-10 rounded-0'
                                                value={newExpenseType}
                                                onChange={e => setNewExpenseType(e.target.value)}
                                            />
                                            <button className='btn btn-sm btn-secondary py-1 rounded-0 w-100 flex-center gap-2 bounceClick'
                                                onClick={handleAddType}
                                            >
                                                <Plus /> Add role
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shares Settings */}
                            <div className="mb-4 p-3 p-xl-4 border-bottom border-secondary border-opacity-25 text-gray-700">
                                <h3>Savings Settings</h3>
                                <div className={`${isAdminUser ? 'd-lg-flex' : ''} align-items-start gap-3`}>
                                    <div className={`mb-2 ${isAdminUser ? 'col-lg-7 col-xl-8' : ''}`}>
                                        <p className='d-list-item list-style-square ms-4'>
                                            Monthly savings due day is on the <b>{getNumberWithSuffix(Number(monthlySavingsDay))}</b>.
                                        </p>
                                        <p className='p-3 border border-secondary border-opacity-10 smaller'>
                                            Monthly contributions and social savings should be recorded by the {getNumberWithSuffix(Number(monthlySavingsDay))} of each month. Any payments made after this date is considered late and subject to delay penalties.
                                        </p>
                                    </div>

                                    {isAdminUser && (
                                        <div className='col'>
                                            <div className="mb-2">
                                                <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change savings due day</p>
                                                <input
                                                    type="number"
                                                    name="interestPrimary"
                                                    readOnly
                                                    className='form-control border border-secondary border-opacity-10 rounded-0'
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
                                    )}
                                </div>
                                <div className={`${isAdminUser ? 'd-lg-flex' : ''} align-items-start gap-3`}>
                                    <div className={`mb-2 ${isAdminUser ? 'col-lg-7 col-xl-8' : ''}`}>
                                        <p className='d-list-item list-style-square ms-4'>
                                            Cotisation savings delay penalty is <CurrencyText amount={Number(cotisationPenalty)} className="fw-bold" />.
                                        </p>
                                        <p className='p-3 border border-secondary border-opacity-10 smaller'>
                                            A penalty of <CurrencyText amount={Number(cotisationPenalty)} /> applies to monthly contribution savings recorded after the due date mentioned above.
                                        </p>
                                    </div>

                                    {isAdminUser && (
                                        <div className='col'>
                                            <div className="mb-2">
                                                <p className='mt-lg-3 mb-1 text-secondary text-center text-uppercase small'>Change Delay Penalty amount</p>
                                                <input
                                                    type="number"
                                                    name="interestPrimary"
                                                    readOnly
                                                    className='form-control border border-secondary border-opacity-10 rounded-0'
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
                                    )}
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