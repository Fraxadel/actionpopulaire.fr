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
import {useLocation, useHistory} from "react-router-dom";
import { useParams } from "react-router"

const StyledSkeleton = styled(Skeleton)`
  &:nth-child(odd) {
    height: 2rem;
    max-width: 50%;
    margin-bottom: 1rem;
  }
`;


const GroupMembershipRemoveRequestPage = (props) => {
    const location = useLocation()
    const history = useHistory();

    const member = location.state?.member
    const removeRequest = location.state?.removeRequest
    const groupId = removeRequest?.supportgroupId ?? location.state?.groupId

    console.log('goback', history.goBack)

    return (
        <div>
            <PageFadeIn ready={member} wait={<StyledSkeleton boxes={6} />}>
                <GroupMemberRemoveRequest
                    member={member}
                    groupId={groupId}
                    removeRequest={removeRequest}
                    onBack={history.goBack}
                    />
            </PageFadeIn>
        </div>
    );
};

export default GroupMembershipRemoveRequestPage;
