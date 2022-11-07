import { GenericButton, Input } from "components/Elements";
import Header from "components/Header";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "services/api.service";
import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { confirmAlert } from "react-confirm-alert";
import { useNavigate } from "react-router-dom";
import { ApiConfig } from "./../../constants";

const eventTypes = {
  applied: { icon: UserIcon, bgColorClass: "bg-gray-400" },
  advanced: { icon: HandThumbUpIcon, bgColorClass: "bg-blue-500" },
  completed: { icon: CheckIcon, bgColorClass: "bg-green-500" },
};

const timeline = [
  {
    id: 1,
    type: eventTypes.applied,
    content: "Applied to",
    target: "Front End Developer",
    date: "Sep 20",
    datetime: "2020-09-20",
  },
  {
    id: 2,
    type: eventTypes.advanced,
    content: "Advanced to phone screening by",
    target: "Bethany Blake",
    date: "Sep 22",
    datetime: "2020-09-22",
  },
  {
    id: 3,
    type: eventTypes.completed,
    content: "Completed phone screening with",
    target: "Martha Gardner",
    date: "Sep 28",
    datetime: "2020-09-28",
  },
  {
    id: 4,
    type: eventTypes.advanced,
    content: "Advanced to interview by",
    target: "Bethany Blake",
    date: "Sep 30",
    datetime: "2020-09-30",
  },
  {
    id: 5,
    type: eventTypes.completed,
    content: "Completed interview with",
    target: "Katherine Snyder",
    date: "Oct 4",
    datetime: "2020-10-04",
  },
];

const KEYS_TO_SKIP = ["_id", "ownerId", "__v"];

const Person = () => {
  const { id } = useParams();
  const [personInfo, setPersonInfo] = useState<Record<string, any>>({});
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await ApiService.get({ url: "/customers/" + id });
      setPersonInfo(data);
    })();
  }, []);

  const handlePersonInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPersonInfo({ ...personInfo, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await ApiService.put({ url: "/customers/" + id, options: personInfo });
    setIsEditingMode(false);
  };

  const handleDeletePerson = () => {
    confirmAlert({
      title: "Confirm delete?",
      message: "Are you sure you want to delete this person?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            await ApiService.post({
              url: ApiConfig.customerDelete + id,
              options: {},
            });
            navigate("/people");
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  const handleDeleteAttribute = (key: string) => {
    const { [key]: value, ...newPersonInfo } = personInfo;
    setPersonInfo(newPersonInfo);
  };

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="w-full min-h-screen">
      <Header />
      <div className="p-[30px_50px]">
        <div className="flex justify-between items-center">
          <div className="">
            <h3 className="text-[32px]">{personInfo.name || personInfo._id}</h3>
            <h6></h6>
          </div>
          <div className="flex h-[50px] gap-[10px]">
            <GenericButton
              onClick={() =>
                isEditingMode ? handleSave() : setIsEditingMode(true)
              }
            >
              {isEditingMode ? "Save" : "Edit"}
            </GenericButton>
            <GenericButton onClick={handleDeletePerson}>Delete</GenericButton>
          </div>
        </div>
        <div className="flex gap-[30px]">
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2 lg:col-start-1">
              <section aria-labelledby="applicant-information-title">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2
                      id="applicant-information-title"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Applicant Information
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Personal details and application.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                      {Object.keys(personInfo)
                        .filter((key) => !KEYS_TO_SKIP.includes(key))
                        .map((key) => (
                          <div className="sm:col-span-1" key={key}>
                            <dt className="text-sm font-medium text-gray-500">
                              {key}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 flex gap-[5px] items-center">
                              {isEditingMode ? (
                                <>
                                  <Input
                                    type="text"
                                    name={key}
                                    id={key}
                                    value={personInfo[key]}
                                    onChange={handlePersonInfoChange}
                                    className="w-full text-ellipsis"
                                  />
                                  <GenericButton
                                    customClasses="flex items-center justify-center rounded-full border border-transparent p-1 text-white shadow-sm h-[38px]"
                                    onClick={() => handleDeleteAttribute(key)}
                                  >
                                    <TrashIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </GenericButton>
                                </>
                              ) : typeof personInfo[key] === "number" ||
                                typeof personInfo[key] === "string" ? (
                                personInfo[key]
                              ) : (
                                JSON.stringify(personInfo[key])
                              )}
                            </dd>
                          </div>
                        ))}
                      {isEditingMode ? (
                        isAddingAttribute ? (
                          <div>
                            <Input
                              name="new-attribute-key"
                              placeholder="key"
                              value={newAttributeKey}
                              onChange={(e) =>
                                setNewAttributeKey(e.target.value)
                              }
                            />
                            <Input
                              name="new-attribute-value"
                              placeholder="value"
                              value={newAttributeValue}
                              onChange={(e) =>
                                setNewAttributeValue(e.target.value)
                              }
                            />
                            <div className="mt-[10px] flex justify-between">
                              <GenericButton
                                disabled={
                                  !newAttributeKey || !newAttributeValue
                                }
                                onClick={() => {
                                  setPersonInfo({
                                    [newAttributeKey]: newAttributeValue,
                                    ...personInfo,
                                  });
                                  setIsAddingAttribute(false);
                                  setNewAttributeKey("");
                                  setNewAttributeValue("");
                                }}
                              >
                                Add
                              </GenericButton>
                              <GenericButton
                                onClick={() => {
                                  setIsAddingAttribute(false);
                                  setNewAttributeKey("");
                                  setNewAttributeValue("");
                                }}
                              >
                                Cancel
                              </GenericButton>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center items-end">
                            <GenericButton
                              onClick={() => setIsAddingAttribute(true)}
                              customClasses="!w-full max-h-[38px]"
                            >
                              New attribute
                            </GenericButton>
                          </div>
                        )
                      ) : (
                        <></>
                      )}
                    </dl>
                  </div>
                  <div>
                    <a
                      href="#"
                      className="block bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-500 hover:text-gray-700 sm:rounded-b-lg"
                    >
                      Read full application
                    </a>
                  </div>
                </div>
              </section>
            </div>

            <section
              aria-labelledby="timeline-title"
              className="lg:col-span-1 lg:col-start-3"
            >
              <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                <h2
                  id="timeline-title"
                  className="text-lg font-medium text-gray-900"
                >
                  Timeline
                </h2>

                {/* Activity Feed */}
                <div className="mt-6 flow-root">
                  <ul role="list" className="-mb-8">
                    {timeline.map((item, itemIdx) => (
                      <li key={item.id}>
                        <div className="relative pb-8">
                          {itemIdx !== timeline.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={classNames(
                                  item.type.bgColorClass,
                                  "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                                )}
                              >
                                <item.type.icon
                                  className="h-5 w-5 text-white"
                                  aria-hidden="true"
                                />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {item.content}{" "}
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    {item.target}
                                  </a>
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                <time dateTime={item.datetime}>
                                  {item.date}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="justify-stretch mt-6 flex flex-col">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Advance to offer
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Person;
