import PropTypes from "prop-types";
import React, { useState } from "react";
import styled from "styled-components";
import useSWRImmutable from "swr/immutable";

import { getGroupEndpoint } from "@agir/groups/utils/api";

import SelectField from "@agir/front/formComponents/SelectField";
import HeaderPanel from "@agir/front/genericComponents/ObjectManagement/HeaderPanel";
import {
    h3,
    StyledTitle,
} from "@agir/front/genericComponents/ObjectManagement/styledComponents";
import PageFadeIn from "@agir/front/genericComponents/PageFadeIn";
import { RawFeatherIcon } from "@agir/front/genericComponents/FeatherIcon";
import Skeleton from "@agir/front/genericComponents/Skeleton";
import Spacer from "@agir/front/genericComponents/Spacer";
import FaIcon from "@agir/front/genericComponents/FaIcon";
import GroupMemberRemoveRequest
    from "@agir/groups/groupPage/GroupSettings/GroupMembershipRemoveRequest/GroupMemberRemoveRequest";


const GroupMembershipRemoveRequestPage = (props) => {
    const { groups, onBack, member, removeRequest } = props;


    return (
        <div>
            <PageFadeIn wait={<StyledSkeleton boxes={6} />}>
                <GroupMemberRemoveRequest
                    member={member}
                    group={group}
                    removeRequest={removeRequest}
                    />


            </PageFadeIn>
        </div>
    );
};

export default GroupMembershipRemoveRequestPage;
