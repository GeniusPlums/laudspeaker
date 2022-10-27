import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3BottomLeftIcon,
  BellIcon,
  BriefcaseIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CogIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import LaudspeakerIcon from "../../assets/images/laudspeakerIcon.svg";
import SaveSettings from "components/SaveSettings";
import { RadioGroup } from "@headlessui/react";
import ApiService from "services/api.service";
import { Input } from "components/Elements";
import Header from "components/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setDomainsList, setSettingsPrivateApiKey } from "reducers/settings";
import { useDispatch } from "react-redux";

const tabs = [
  { name: "Account", href: "/settings", current: false },
  { name: "API", href: "/settings/api", current: false },
  { name: "Email", href: "", current: true },
  { name: "SMS", href: "/settings/sms", current: false },
  { name: "Slack", href: "/settings/slack", current: false },
  { name: "Events", href: "/settings/events", current: false },
  { name: "Plan", href: "/settings/plan", current: false },
  { name: "Billing", href: "/settings/billing", current: false },
  { name: "Team Members", href: "/settings/team", current: false },
];
const memoryOptions = [
  { name: "Mailgun", inStock: true },
  { name: "Sendgrid", inStock: false },
  { name: "Mailchimp", inStock: false },
  { name: "SMTP", inStock: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SettingsEmailBeta() {
  const [mem, setMem] = useState(memoryOptions[0]);
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState({
    mailgunAPIKey: "",
    sendingDomain: "",
    sendingName: "",
    sendingEmail: "",
  });

  const [formData, setFormData] = useState({
    mailgunAPIKey: "",
    sendingDomain: "",
    sendingName: "",
    sendingEmail: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string[] }>({
    mailgunAPIKey: [],
    sendingDomain: [],
    sendingName: [],
    sendingEmail: [],
  });

  const [possibleDomains, setPossibleDomains] = useState<string[]>([]);

  const dispatch = useDispatch();
  const callDomains = async () => {
    if (formData.mailgunAPIKey) {
      dispatch(setSettingsPrivateApiKey(formData.mailgunAPIKey));
      const response = await dispatch(setDomainsList(formData.mailgunAPIKey));
      if (response?.data) {
        setPossibleDomains(response?.data?.map((item: any) => item.name) || []);
      }
    }
  };

  useEffect(() => {
    const newErrors: { [key: string]: string[] } = {
      mailgunAPIKey: [],
      sendingDomain: [],
      sendingName: [],
      sendingEmail: [],
    };

    if (!formData.mailgunAPIKey)
      newErrors.mailgunAPIKey.push("API key should be provided");

    if (!formData.sendingName)
      newErrors.sendingName.push("Sending name should be provided");

    if (
      !`${formData.sendingEmail}@laudspeaker.com`.match(
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      )
    )
      newErrors.sendingEmail.push("Email should be valid");

    setErrors(newErrors);
  }, [formData]);

  const isError = Object.values(errors).some((arr) => arr.length > 0);

  useEffect(() => {
    (async () => {
      const { data } = await ApiService.get({ url: "/accounts" });
      const { mailgunAPIKey, sendingDomain, sendingName, sendingEmail } = data;
      setFormData({
        mailgunAPIKey: mailgunAPIKey || "",
        sendingDomain: sendingDomain || "",
        sendingName: sendingName || "",
        sendingEmail: sendingEmail || "",
      });
      setInitialData({
        mailgunAPIKey: mailgunAPIKey || "",
        sendingDomain: sendingDomain || "",
        sendingName: sendingName || "",
        sendingEmail: sendingEmail || "",
      });
    })();
  }, []);

  const handleFormDataChange = (e: any) => {
    console.log(e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await ApiService.patch({ url: "/accounts", options: { ...formData } });
    } catch (e) {
      toast.error("Unexpected error!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <div>
        {/* Content area */}
        <div className="">
          <div className="mx-auto flex flex-col">
            <Header />

            <main className="flex-1">
              <div className="relative mx-auto max-w-4xl md:px-8 xl:px-0">
                <div className="pt-10 pb-16">
                  <div className="px-4 sm:px-6 md:px-0">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                      Settings
                    </h1>
                  </div>
                  <div className="px-4 sm:px-6 md:px-0">
                    <div className="py-6">
                      {/* Tabs */}
                      <div className="lg:hidden">
                        <label htmlFor="selected-tab" className="sr-only">
                          Select a tab
                        </label>
                        <select
                          id="selected-tab"
                          name="selected-tab"
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                          defaultValue={tabs.find((tab) => tab.current)?.href}
                          onChange={(ev) => navigate(ev.currentTarget.value)}
                        >
                          {tabs.map((tab) => (
                            <option key={tab.name} value={tab.href}>
                              {tab.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="hidden lg:block">
                        <div className="border-b border-gray-200">
                          <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                              <a
                                key={tab.name}
                                href={tab.href}
                                className={classNames(
                                  tab.current
                                    ? "border-cyan-500 text-cyan-600"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                                )}
                              >
                                {tab.name}
                              </a>
                            ))}
                          </nav>
                        </div>
                      </div>

                      {/* Description list with inline editing */}
                      <div className="mt-10">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Select Your Email Provider
                          </h3>
                          <p className="max-w-2xl text-sm text-gray-500">
                            For instructions on where to find these values,
                            please see our documentation.
                          </p>
                        </div>
                        <div className="space-y-10">
                          <div className="flex items-center justify-between"></div>

                          <RadioGroup
                            value={mem}
                            onChange={setMem}
                            className="mt-2"
                          >
                            <RadioGroup.Label className="sr-only">
                              {" "}
                              Choose a memory option{" "}
                            </RadioGroup.Label>
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                              {memoryOptions.map((option) => (
                                <RadioGroup.Option
                                  key={option.name}
                                  value={option}
                                  className={({ active, checked }) =>
                                    classNames(
                                      option.inStock
                                        ? "cursor-pointer focus:outline-none"
                                        : "opacity-25 cursor-not-allowed",
                                      active
                                        ? "ring-2 ring-offset-2 ring-cyan-500"
                                        : "",
                                      checked
                                        ? "bg-cyan-600 border-transparent text-white hover:bg-cyan-700"
                                        : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
                                      "border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1"
                                    )
                                  }
                                  disabled={!option.inStock}
                                >
                                  <RadioGroup.Label as="span">
                                    {option.name}
                                  </RadioGroup.Label>
                                </RadioGroup.Option>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="mt-6">
                          <dl className="divide-y divide-gray-200">
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                              <dt className="text-sm font-medium text-gray-500">
                                Mailgun API Key
                              </dt>
                              <dd>
                                <div className="relative rounded-md ">
                                  <Input
                                    type="password"
                                    value={formData.mailgunAPIKey}
                                    onChange={handleFormDataChange}
                                    name="mailgunAPIKey"
                                    id="mailgunAPIKey"
                                    className={classNames(
                                      errors.mailgunAPIKey.length > 0
                                        ? "rounded-md sm:text-sm focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500 "
                                        : "rounded-md sm:text-sm focus:border-cyan-500 border-gray-300 shadow-sm focus:ring-cyan-500 "
                                    )}
                                    aria-invalid="true"
                                    aria-describedby="password-error"
                                    onBlur={callDomains}
                                  />
                                  {errors.mailgunAPIKey.length > 0 && (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                      <ExclamationCircleIcon
                                        className="h-5 w-5 text-red-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  )}
                                </div>
                                {errors.mailgunAPIKey.map((item) => (
                                  <p
                                    className="mt-2 text-sm text-red-600"
                                    id="email-error"
                                    key={item}
                                  >
                                    {item}
                                  </p>
                                ))}
                              </dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                              <dt className="text-sm font-medium text-gray-500">
                                Sending Domain
                              </dt>
                              <dd>
                                <div className="relative rounded-md">
                                  <select
                                    id="sendingDomain"
                                    name="sendingDomain"
                                    disabled={
                                      !formData.mailgunAPIKey ||
                                      possibleDomains.length === 0
                                    }
                                    value={formData.sendingDomain}
                                    onChange={handleFormDataChange}
                                    className={`mt-1 block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm ${
                                      errors.sendingDomain.length > 0
                                        ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                                        : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                    }`}
                                  >
                                    <option value={formData.sendingDomain}>
                                      {formData.sendingDomain}
                                    </option>
                                    {possibleDomains.map((item) => (
                                      <option value={item}>{item}</option>
                                    ))}
                                  </select>
                                  {errors.sendingDomain.length > 0 && (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                      <ExclamationCircleIcon
                                        className="h-5 w-5 text-red-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  )}
                                </div>

                                {errors.sendingDomain.map((item) => (
                                  <p
                                    className="mt-2 text-sm text-red-600"
                                    id="email-error"
                                    key={item}
                                  >
                                    {item}
                                  </p>
                                ))}
                              </dd>
                            </div>

                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                              <dt className="text-sm font-medium text-gray-500">
                                Sending Name
                              </dt>
                              <dd>
                                <div className="relative rounded-md">
                                  {" "}
                                  <Input
                                    type="text"
                                    value={formData.sendingName}
                                    onChange={handleFormDataChange}
                                    name="sendingName"
                                    id="sendingName"
                                    className={`rounded-md shadow-sm sm:text-sm ${
                                      errors.sendingName.length > 0
                                        ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                                        : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                    }`}
                                    placeholder="Team Laudspeaker"
                                  />
                                  {errors.sendingName.length > 0 && (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                      <ExclamationCircleIcon
                                        className="h-5 w-5 text-red-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  )}
                                </div>
                                {errors.sendingName.map((item) => (
                                  <p
                                    className="mt-2 text-sm text-red-600"
                                    id="email-error"
                                    key={item}
                                  >
                                    {item}
                                  </p>
                                ))}
                              </dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                              <dt className="text-sm font-medium text-gray-500">
                                Sending Email
                              </dt>
                              <dd>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                  <Input
                                    type="text"
                                    value={formData.sendingEmail}
                                    onChange={handleFormDataChange}
                                    name="sendingEmail"
                                    id="sendingEmail"
                                    className={`rounded-md shadow-sm sm:text-sm pr-[150px] ${
                                      errors.sendingEmail.length > 0
                                        ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                                        : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                    }`}
                                    placeholder="noreply"
                                  />
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span
                                      className="text-gray-500 sm:text-sm"
                                      id="price-currency"
                                    >
                                      @laudspeaker.com
                                    </span>
                                  </div>
                                  {errors.sendingEmail.length > 0 && (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                      <ExclamationCircleIcon
                                        className="h-5 w-5 text-red-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  )}
                                </div>
                                {errors.sendingEmail.map((item) => (
                                  <p
                                    className="mt-2 text-sm text-red-600"
                                    id="email-error"
                                    key={item}
                                  >
                                    {item}
                                  </p>
                                ))}
                              </dd>
                            </div>
                            <SaveSettings
                              disabled={isError}
                              onClick={handleSubmit}
                            />
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}